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
  cardToken?: string;
  installments?: number;
  gateway?: 'abacatepay' | 'asaas';
}

// ============= ASAAS INTEGRATION =============
async function createAsaasPayment(
  body: CreatePaymentRequest,
  supabase: any,
  origin: string,
  cleanCpf: string,
  cleanPhone: string,
  priceCents: number,
  ASAAS_API_KEY: string,
  sandboxMode: boolean
) {
  const baseUrl = sandboxMode 
    ? 'https://sandbox.asaas.com/api/v3' 
    : 'https://api.asaas.com/v3';

  console.log(`[Asaas] Creating payment via ${sandboxMode ? 'SANDBOX' : 'PRODUCTION'}...`);

  // Step 1: Create or find customer
  const customerName = `${body.customer.firstName} ${body.customer.lastName}`;
  const customerEmail = body.customer.email || `${cleanCpf}@checkout.local`;
  
  // Check if customer exists
  const findCustomerResponse = await fetch(`${baseUrl}/customers?cpfCnpj=${cleanCpf}`, {
    headers: {
      'access_token': ASAAS_API_KEY,
      'Content-Type': 'application/json',
    },
  });
  
  let asaasCustomerId: string;
  const findCustomerData = await findCustomerResponse.json();
  console.log('[Asaas] Find customer response:', findCustomerData);

  if (findCustomerData.data && findCustomerData.data.length > 0) {
    asaasCustomerId = findCustomerData.data[0].id;
    console.log('[Asaas] Using existing customer:', asaasCustomerId);
  } else {
    // Create new customer
    const createCustomerResponse = await fetch(`${baseUrl}/customers`, {
      method: 'POST',
      headers: {
        'access_token': ASAAS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: customerName,
        email: customerEmail,
        phone: `${body.customer.phoneCountryCode}${cleanPhone}`,
        cpfCnpj: cleanCpf,
        notificationDisabled: true,
      }),
    });

    const createCustomerData = await createCustomerResponse.json();
    console.log('[Asaas] Create customer response:', createCustomerData);

    if (!createCustomerResponse.ok) {
      throw new Error(createCustomerData.errors?.[0]?.description || 'Erro ao criar cliente no Asaas');
    }
    asaasCustomerId = createCustomerData.id;
  }

  // Step 2: Create payment
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 1); // Due tomorrow for more flexibility

  const paymentPayload: Record<string, unknown> = {
    customer: asaasCustomerId,
    billingType: body.paymentMethod === 'PIX' ? 'PIX' : 'CREDIT_CARD',
    value: priceCents / 100, // Asaas uses reais, not centavos
    dueDate: dueDate.toISOString().split('T')[0],
    description: body.description || 'Pagamento',
    externalReference: `checkout-${Date.now()}`,
  };

  // Add installments for credit card
  if (body.paymentMethod === 'CARD' && body.installments && body.installments > 1) {
    paymentPayload.installmentCount = body.installments;
    paymentPayload.installmentValue = (priceCents / 100) / body.installments;
  }

  const paymentResponse = await fetch(`${baseUrl}/payments`, {
    method: 'POST',
    headers: {
      'access_token': ASAAS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentPayload),
  });

  const paymentData = await paymentResponse.json();
  console.log('[Asaas] Payment response:', paymentData);

  if (!paymentResponse.ok) {
    throw new Error(paymentData.errors?.[0]?.description || 'Erro ao criar pagamento no Asaas');
  }

  let pixBrCode: string | null = null;
  let pixQrCodeBase64: string | null = null;
  let asaasPaymentId = paymentData.id;
  let abacatepayUrl: string | null = null;

  // Step 3: Get PIX QR Code if payment method is PIX
  if (body.paymentMethod === 'PIX') {
    // Wait a moment for Asaas to generate the PIX
    await new Promise(resolve => setTimeout(resolve, 500));

    const pixResponse = await fetch(`${baseUrl}/payments/${asaasPaymentId}/pixQrCode`, {
      headers: {
        'access_token': ASAAS_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    const pixData = await pixResponse.json();
    console.log('[Asaas] PIX QR Code response:', pixData);

    if (pixResponse.ok) {
      pixBrCode = pixData.payload || null;
      pixQrCodeBase64 = pixData.encodedImage || null;
    }
  } else {
    // For credit card, get the payment link
    abacatepayUrl = paymentData.invoiceUrl || null;
  }

  return {
    gatewayPaymentId: asaasPaymentId,
    pixBrCode,
    pixQrCodeBase64,
    abacatepayUrl,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  };
}

// ============= ABACATEPAY INTEGRATION =============
async function createAbacatePayment(
  body: CreatePaymentRequest,
  origin: string,
  cleanCpf: string,
  cleanPhone: string,
  priceCents: number,
  ABACATEPAY_API_KEY: string
) {
  let pixBrCode: string | null = null;
  let pixQrCodeBase64: string | null = null;
  let abacatepayBillingId: string | null = null;
  let abacatepayUrl: string | null = null;

  if (body.paymentMethod === 'PIX') {
    console.log('[AbacatePay] Creating PIX QR Code...');
    
    const pixPayload = {
      amount: priceCents,
      expiresIn: 600,
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
    console.log('[AbacatePay] PIX response:', { status: pixResponse.status });

    if (!pixResponse.ok) {
      throw new Error(pixData.error || 'Erro ao gerar QR Code PIX');
    }

    abacatepayBillingId = pixData.data?.id || null;
    pixBrCode = pixData.data?.brCode || null;
    const rawBase64 = pixData.data?.brCodeBase64 || pixData.data?.qrCodeBase64 || null;
    if (rawBase64 && rawBase64.startsWith('data:image')) {
      pixQrCodeBase64 = rawBase64.split(',')[1] || rawBase64;
    } else {
      pixQrCodeBase64 = rawBase64;
    }
  } else {
    console.log('[AbacatePay] Creating billing for CARD...');
    
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
    console.log('[AbacatePay] Billing response:', { status: billingResponse.status });

    if (!billingResponse.ok) {
      throw new Error(billingData.error || 'Erro ao criar cobrança');
    }

    abacatepayBillingId = billingData.data?.id || null;
    abacatepayUrl = billingData.data?.url || null;
  }

  return {
    gatewayPaymentId: abacatepayBillingId,
    pixBrCode,
    pixQrCodeBase64,
    abacatepayUrl,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: CreatePaymentRequest = await req.json();
    console.log('Creating payment:', { 
      paymentMethod: body.paymentMethod, 
      amountCents: body.amountCents,
      gateway: body.gateway || 'auto-detect'
    });

    if (!body.customer || !body.amountCents || !body.paymentMethod) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanCpf = body.customer.cpf.replace(/\D/g, '');
    const cleanPhone = body.customer.phone.replace(/\D/g, '');
    const priceCents = Math.round(body.amountCents);

    if (!Number.isFinite(priceCents) || priceCents < 100) {
      return new Response(
        JSON.stringify({ error: 'Valor mínimo é R$ 1,00' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine which gateway to use
    const ABACATEPAY_API_KEY = Deno.env.get('ABACATEPAY_API_KEY');
    const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY');
    const ASAAS_SANDBOX = Deno.env.get('ASAAS_SANDBOX') === 'true';

    let selectedGateway = body.gateway;

    // If no gateway specified, check active config from database
    if (!selectedGateway) {
      const { data: activeConfig } = await supabase
        .from('checkout_gateway_config')
        .select('gateway, sandbox_mode')
        .eq('is_active', true)
        .eq('api_key_configured', true)
        .single();

      if (activeConfig) {
        selectedGateway = activeConfig.gateway;
        console.log('Using gateway from config:', selectedGateway);
      } else {
        // Fallback: use whichever API key is available
        if (ASAAS_API_KEY) {
          selectedGateway = 'asaas';
        } else if (ABACATEPAY_API_KEY) {
          selectedGateway = 'abacatepay';
        }
      }
    }

    console.log('Selected gateway:', selectedGateway);

    // Check if we have the required API key
    if (selectedGateway === 'asaas' && !ASAAS_API_KEY) {
      console.error('ASAAS_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Gateway Asaas não configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (selectedGateway === 'abacatepay' && !ABACATEPAY_API_KEY) {
      console.error('ABACATEPAY_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Gateway AbacatePay não configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!selectedGateway) {
      return new Response(
        JSON.stringify({ error: 'Nenhum gateway de pagamento configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create or find customer
    const { data: existingCustomer } = await supabase
      .from('checkout_customers')
      .select('id')
      .eq('cpf', cleanCpf)
      .single();

    let customerId: string;

    if (existingCustomer) {
      customerId = existingCustomer.id;
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

    const origin = req.headers.get('origin') || 'https://www.genesishub.cloud';

    let paymentResult;

    try {
      if (selectedGateway === 'asaas') {
        paymentResult = await createAsaasPayment(
          body, supabase, origin, cleanCpf, cleanPhone, priceCents, ASAAS_API_KEY!, ASAAS_SANDBOX
        );
      } else {
        paymentResult = await createAbacatePayment(
          body, origin, cleanCpf, cleanPhone, priceCents, ABACATEPAY_API_KEY!
        );
      }
    } catch (gatewayError) {
      console.error('Gateway error:', gatewayError);
      return new Response(
        JSON.stringify({ error: (gatewayError as Error).message }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate payment code
    const paymentCode = paymentResult.gatewayPaymentId || 
      `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('checkout_payments')
      .insert({
        payment_code: paymentCode,
        customer_id: customerId,
        amount_cents: priceCents,
        description: body.description,
        payment_method: body.paymentMethod,
        gateway: selectedGateway,
        abacatepay_billing_id: selectedGateway === 'abacatepay' ? paymentResult.gatewayPaymentId : null,
        asaas_payment_id: selectedGateway === 'asaas' ? paymentResult.gatewayPaymentId : null,
        abacatepay_url: paymentResult.abacatepayUrl,
        pix_br_code: paymentResult.pixBrCode,
        pix_qr_code_base64: paymentResult.pixQrCodeBase64,
        status: 'pending',
        expires_at: paymentResult.expiresAt,
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

    await supabase.from('checkout_payment_events').insert({
      payment_id: payment.id,
      event_type: 'payment_created',
      event_data: { paymentMethod: body.paymentMethod, amountCents: body.amountCents, gateway: selectedGateway },
      source: 'api',
    });

    console.log('Payment created successfully:', payment.payment_code, { gateway: selectedGateway });

    return new Response(
      JSON.stringify({
        success: true,
        paymentCode: payment.payment_code,
        pixBrCode: payment.pix_br_code,
        pixQrCodeBase64: payment.pix_qr_code_base64,
        abacatepayUrl: payment.abacatepay_url,
        expiresAt: payment.expires_at,
        gateway: selectedGateway,
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
