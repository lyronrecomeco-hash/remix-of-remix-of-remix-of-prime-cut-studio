import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ABACATEPAY_API_KEY = Deno.env.get('ABACATEPAY_API_KEY');
    if (!ABACATEPAY_API_KEY) {
      console.error('ABACATEPAY_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { paymentCode } = await req.json();

    if (!paymentCode) {
      return new Response(
        JSON.stringify({ error: 'Payment code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Regenerating payment for:', paymentCode);

    // Get expired payment
    const { data: oldPayment, error: paymentError } = await supabase
      .from('checkout_payments')
      .select(`
        *,
        customer:checkout_customers(*)
      `)
      .eq('payment_code', paymentCode)
      .single();

    if (paymentError || !oldPayment) {
      console.error('Payment not found:', paymentError);
      return new Response(
        JSON.stringify({ error: 'Payment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only allow regeneration for expired payments
    if (oldPayment.status !== 'expired') {
      return new Response(
        JSON.stringify({ error: 'Only expired payments can be regenerated' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const customer = oldPayment.customer;
    if (!customer) {
      return new Response(
        JSON.stringify({ error: 'Customer not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create new AbacatePay billing
    const abacatePayload = {
      frequency: 'ONE_TIME',
      methods: [oldPayment.payment_method || 'PIX'],
      products: [{
        externalId: `checkout-regen-${Date.now()}`,
        name: oldPayment.description || 'Pagamento',
        quantity: 1,
        price: oldPayment.amount_cents / 100,
      }],
      customer: {
        name: `${customer.first_name} ${customer.last_name}`,
        email: customer.email || `${customer.cpf}@checkout.local`,
        cellphone: `${customer.phone_country_code}${customer.phone}`,
        taxId: customer.cpf,
      },
      completionUrl: `${req.headers.get('origin') || 'https://shave-style-pro.lovable.app'}/checkout/success`,
    };

    console.log('Creating new AbacatePay billing...');
    
    const abacateResponse = await fetch('https://api.abacatepay.com/v1/billing/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ABACATEPAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(abacatePayload),
    });

    const abacateData = await abacateResponse.json();
    console.log('AbacatePay response:', { status: abacateResponse.status });

    if (!abacateResponse.ok) {
      console.error('AbacatePay error:', abacateData);
      return new Response(
        JSON.stringify({ error: abacateData.error || 'Payment gateway error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate new expiration (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Create new payment record
    const { data: newPayment, error: newPaymentError } = await supabase
      .from('checkout_payments')
      .insert({
        customer_id: customer.id,
        amount_cents: oldPayment.amount_cents,
        description: oldPayment.description,
        payment_method: oldPayment.payment_method,
        abacatepay_billing_id: abacateData.data?.id,
        abacatepay_url: abacateData.data?.url,
        pix_br_code: abacateData.data?.pix?.brCode,
        pix_qr_code_base64: abacateData.data?.pix?.qrCodeBase64,
        status: 'pending',
        expires_at: expiresAt,
        metadata: { 
          ...oldPayment.metadata as object,
          regenerated_from: paymentCode 
        },
      })
      .select('payment_code, pix_br_code, pix_qr_code_base64, expires_at')
      .single();

    if (newPaymentError || !newPayment) {
      console.error('Error creating new payment:', newPaymentError);
      return new Response(
        JSON.stringify({ error: 'Failed to create new payment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log regeneration event on old payment
    await supabase.from('checkout_payment_events').insert({
      payment_id: oldPayment.id,
      event_type: 'payment_regenerated',
      event_data: { new_payment_code: newPayment.payment_code },
      source: 'api',
    });

    console.log('Payment regenerated successfully:', newPayment.payment_code);

    return new Response(
      JSON.stringify({
        success: true,
        paymentCode: newPayment.payment_code,
        pixBrCode: newPayment.pix_br_code,
        pixQrCodeBase64: newPayment.pix_qr_code_base64,
        expiresAt: newPayment.expires_at,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
