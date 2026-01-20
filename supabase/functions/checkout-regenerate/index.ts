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

    let pixBrCode: string | null = null;
    let pixQrCodeBase64: string | null = null;
    let abacatepayBillingId: string | null = null;

    // For PIX regeneration, use the dedicated pixQrCode/create endpoint
    if (oldPayment.payment_method === 'PIX') {
      console.log('Creating new PIX QR Code via pixQrCode/create...');
      
      const pixPayload = {
        amount: oldPayment.amount_cents, // Amount in centavos
        expiresIn: 600, // 10 minutes in seconds
        description: oldPayment.description || 'Pagamento PIX',
        customer: {
          name: `${customer.first_name} ${customer.last_name}`,
          email: customer.email || `${customer.cpf}@checkout.local`,
          cellphone: `${customer.phone_country_code}${customer.phone}`,
          taxId: customer.cpf,
        },
      };

      const pixResponse = await fetch('https://api.abacatepay.com/v1/pixQrCode/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ABACATEPAY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pixPayload),
      });

      const pixData = await pixResponse.json();
      console.log('AbacatePay PIX response:', { status: pixResponse.status });

      if (!pixResponse.ok) {
        console.error('AbacatePay PIX error:', pixData);
        return new Response(
          JSON.stringify({ error: pixData.error || 'Erro ao gerar QR Code PIX' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      abacatepayBillingId = pixData.data?.id || null;
      pixBrCode = pixData.data?.brCode || null;
      // Handle both brCodeBase64 and qrCodeBase64 field names
      const rawBase64 = pixData.data?.brCodeBase64 || pixData.data?.qrCodeBase64 || null;
      // Remove data:image prefix if present, keep only base64 string
      if (rawBase64 && rawBase64.startsWith('data:image')) {
        pixQrCodeBase64 = rawBase64.split(',')[1] || rawBase64;
      } else {
        pixQrCodeBase64 = rawBase64;
      }
    }

    // Calculate new expiration (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Generate new payment code
    const newPaymentCode = abacatepayBillingId || `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create new payment record
    const { data: newPayment, error: newPaymentError } = await supabase
      .from('checkout_payments')
      .insert({
        payment_code: newPaymentCode,
        customer_id: customer.id,
        amount_cents: oldPayment.amount_cents,
        description: oldPayment.description,
        payment_method: oldPayment.payment_method,
        abacatepay_billing_id: abacatepayBillingId,
        pix_br_code: pixBrCode,
        pix_qr_code_base64: pixQrCodeBase64,
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

    console.log('Payment regenerated successfully:', newPayment.payment_code, { pixBrCode: !!pixBrCode, pixQrCode: !!pixQrCodeBase64 });

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
