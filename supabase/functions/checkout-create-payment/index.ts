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

    // AbacatePay expects amount in CENTAVOS and requires minimum of 100 centavos (R$1.00)
    const priceCents = Math.round(body.amountCents);

    // Validate minimum amount
    if (!Number.isFinite(priceCents) || priceCents < 100) {
      console.error('Amount too low:', body.amountCents);
      return new Response(
        JSON.stringify({ error: 'Valor mínimo é R$ 1,00' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const origin = req.headers.get('origin') || 'https://www.genesishub.cloud';

    let pixBrCode: string | null = null;
    let pixQrCodeBase64: string | null = null;
    let abacatepayBillingId: string | null = null;
    let abacatepayUrl: string | null = null;

    if (body.paymentMethod === 'PIX') {
      // For PIX, use the dedicated pixQrCode/create endpoint
      console.log('Creating PIX QR Code via pixQrCode/create...');
      
      const pixPayload = {
        amount: priceCents, // Amount in centavos
        expiresIn: 600, // 10 minutes in seconds
        description: body.description || 'Pagamento PIX',
        customer: {
          name: `${body.customer.firstName} ${body.customer.lastName}`,
          email: body.customer.email || `${cleanCpf}@checkout.local`,
          cellphone: `${body.customer.phoneCountryCode}${cleanPhone}`,
          taxId: cleanCpf,
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
      console.log('AbacatePay PIX response:', { status: pixResponse.status, data: pixData });

      if (!pixResponse.ok) {
        console.error('AbacatePay PIX error:', pixData);
        return new Response(
          JSON.stringify({ error: pixData.error || 'Erro ao gerar QR Code PIX' }),
          { status: pixResponse.status >= 400 && pixResponse.status < 500 ? 400 : 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      
    } else {
      // For CARD, use the billing/create endpoint
      console.log('Creating billing for CARD payment...');
      
      const billingPayload = {
        frequency: 'ONE_TIME',
        methods: ['CARD'],
        products: [{
          externalId: `checkout-${Date.now()}`,
          name: body.description || 'Pagamento',
          quantity: 1,
          price: priceCents,
        }],
        customer: {
          name: `${body.customer.firstName} ${body.customer.lastName}`,
          email: body.customer.email || `${cleanCpf}@checkout.local`,
          cellphone: `${body.customer.phoneCountryCode}${cleanPhone}`,
          taxId: cleanCpf,
        },
        returnUrl: `${origin}/checkout/pending`,
        completionUrl: `${origin}/checkout/success`,
      };

      const billingResponse = await fetch('https://api.abacatepay.com/v1/billing/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ABACATEPAY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billingPayload),
      });

      const billingData = await billingResponse.json();
      console.log('AbacatePay billing response:', { status: billingResponse.status, data: billingData });

      if (!billingResponse.ok) {
        console.error('AbacatePay billing error:', billingData);
        return new Response(
          JSON.stringify({ error: billingData.error || 'Erro ao criar cobrança' }),
          { status: billingResponse.status >= 400 && billingResponse.status < 500 ? 400 : 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      abacatepayBillingId = billingData.data?.id || null;
      abacatepayUrl = billingData.data?.url || null;
    }

    // Calculate expiration (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Generate unique payment code
    const paymentCode = abacatepayBillingId || `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('checkout_payments')
      .insert({
        payment_code: paymentCode,
        customer_id: customerId,
        amount_cents: priceCents,
        description: body.description,
        payment_method: body.paymentMethod,
        abacatepay_billing_id: abacatepayBillingId,
        abacatepay_url: abacatepayUrl,
        pix_br_code: pixBrCode,
        pix_qr_code_base64: pixQrCodeBase64,
        status: 'pending',
        expires_at: expiresAt,
        metadata: body.metadata,
        installments: body.installments,
      })
      .select('id, payment_code, pix_br_code, pix_qr_code_base64, expires_at, abacatepay_url')
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
      payment_id: payment.id,
      event_type: 'payment_created',
      event_data: { paymentMethod: body.paymentMethod, amountCents: body.amountCents },
      source: 'api',
    });

    console.log('Payment created successfully:', payment.payment_code, { pixBrCode: !!pixBrCode, pixQrCode: !!pixQrCodeBase64 });

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
