import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreatePaymentRequest {
  customer: {
    firstName: string;
    lastName: string;
    cpf: string;
    phone: string;
    phoneCountryCode: string;
    email?: string;
  };
  amountCents: number;
  description: string;
  paymentMethod: 'PIX' | 'CARD';
  metadata?: Record<string, unknown>;
  // Card specific
  cardToken?: string;
  installments?: number;
}

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

    const body: CreatePaymentRequest = await req.json();
    console.log('Creating payment:', { 
      paymentMethod: body.paymentMethod, 
      amountCents: body.amountCents,
      customer: { ...body.customer, cpf: '***' }
    });

    // Validate required fields
    if (!body.customer || !body.amountCents || !body.paymentMethod) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean CPF (remove formatting)
    const cleanCpf = body.customer.cpf.replace(/\D/g, '');
    const cleanPhone = body.customer.phone.replace(/\D/g, '');

    // Create or find customer
    const { data: existingCustomer } = await supabase
      .from('checkout_customers')
      .select('id')
      .eq('cpf', cleanCpf)
      .single();

    let customerId: string;

    if (existingCustomer) {
      customerId = existingCustomer.id;
      // Update customer info
      await supabase
        .from('checkout_customers')
        .update({
          first_name: body.customer.firstName,
          last_name: body.customer.lastName,
          phone: cleanPhone,
          phone_country_code: body.customer.phoneCountryCode,
          email: body.customer.email,
        })
        .eq('id', customerId);
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from('checkout_customers')
        .insert({
          first_name: body.customer.firstName,
          last_name: body.customer.lastName,
          cpf: cleanCpf,
          phone: cleanPhone,
          phone_country_code: body.customer.phoneCountryCode,
          email: body.customer.email,
        })
        .select('id')
        .single();

      if (customerError || !newCustomer) {
        console.error('Error creating customer:', customerError);
        return new Response(
          JSON.stringify({ error: 'Failed to create customer' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      customerId = newCustomer.id;
    }

    // Create AbacatePay billing
    // AbacatePay requires minimum of 100 centavos (R$1.00) 
    // The price field expects the value in REAIS (not centavos)
    const priceInReais = body.amountCents / 100;
    
    // Validate minimum amount
    if (priceInReais < 1) {
      console.error('Amount too low:', priceInReais);
      return new Response(
        JSON.stringify({ error: 'Valor mínimo é R$ 1,00' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const abacatePayload = {
      frequency: 'ONE_TIME',
      methods: [body.paymentMethod],
      products: [{
        externalId: `checkout-${Date.now()}`,
        name: body.description || 'Pagamento',
        quantity: 1,
        price: priceInReais,
      }],
      customer: {
        name: `${body.customer.firstName} ${body.customer.lastName}`,
        email: body.customer.email || `${cleanCpf}@checkout.local`,
        cellphone: `${body.customer.phoneCountryCode}${cleanPhone}`,
        taxId: cleanCpf,
      },
      completionUrl: `${req.headers.get('origin') || 'https://shave-style-pro.lovable.app'}/checkout/success`,
    };

    console.log('Calling AbacatePay API...');
    
    const abacateResponse = await fetch('https://api.abacatepay.com/v1/billing/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ABACATEPAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(abacatePayload),
    });

    const abacateData = await abacateResponse.json();
    console.log('AbacatePay response:', { status: abacateResponse.status, data: abacateData });

    if (!abacateResponse.ok) {
      console.error('AbacatePay error:', abacateData);
      return new Response(
        JSON.stringify({ error: abacateData.error || 'Payment gateway error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate expiration (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('checkout_payments')
      .insert({
        customer_id: customerId,
        amount_cents: body.amountCents,
        description: body.description,
        payment_method: body.paymentMethod,
        abacatepay_billing_id: abacateData.data?.id,
        abacatepay_url: abacateData.data?.url,
        pix_br_code: abacateData.data?.pix?.brCode,
        pix_qr_code_base64: abacateData.data?.pix?.qrCodeBase64,
        status: 'pending',
        expires_at: expiresAt,
        metadata: body.metadata,
        installments: body.installments,
      })
      .select('payment_code, pix_br_code, pix_qr_code_base64, expires_at, abacatepay_url')
      .single();

    if (paymentError || !payment) {
      console.error('Error creating payment record:', paymentError);
      return new Response(
        JSON.stringify({ error: 'Failed to create payment record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log payment creation event
    await supabase.from('checkout_payment_events').insert({
      payment_id: (await supabase.from('checkout_payments').select('id').eq('payment_code', payment.payment_code).single()).data?.id,
      event_type: 'payment_created',
      event_data: { paymentMethod: body.paymentMethod, amountCents: body.amountCents },
      source: 'api',
    });

    console.log('Payment created successfully:', payment.payment_code);

    return new Response(
      JSON.stringify({
        success: true,
        paymentCode: payment.payment_code,
        pixBrCode: payment.pix_br_code,
        pixQrCodeBase64: payment.pix_qr_code_base64,
        abacatepayUrl: payment.abacatepay_url,
        expiresAt: payment.expires_at,
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
