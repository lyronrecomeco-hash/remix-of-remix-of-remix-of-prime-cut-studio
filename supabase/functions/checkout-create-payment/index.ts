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
  gateway?: 'abacatepay' | 'asaas' | 'misticpay';
}

// Helper to decrypt API key
function decryptApiKey(encrypted: string, userId: string): string {
  const secret = `${userId}-genesis-gateway-2024`;
  const decoded = atob(encrypted);
  let result = '';
  for (let i = 0; i < decoded.length; i++) {
    result += String.fromCharCode(decoded.charCodeAt(i) ^ secret.charCodeAt(i % secret.length));
  }
  return result;
}

// ============= MISTICPAY INTEGRATION =============
async function createMisticPayPayment(
  body: CreatePaymentRequest,
  cleanCpf: string,
  priceCents: number,
  clientId: string,
  clientSecret: string,
  webhookUrl: string
) {
  console.log('[MisticPay] Creating PIX payment...');
  
  // MisticPay only supports PIX
  if (body.paymentMethod !== 'PIX') {
    throw new Error('MisticPay suporta apenas PIX. Para cartão, use outro gateway.');
  }

  const transactionId = `genesis-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const customerName = `${body.customer.firstName} ${body.customer.lastName}`;
  const amountReais = priceCents / 100; // MisticPay uses reais, not centavos

  const payload = {
    amount: amountReais,
    payerName: customerName,
    payerDocument: cleanCpf,
    transactionId: transactionId,
    description: body.description || 'Pagamento PIX',
    projectWebhook: webhookUrl,
  };

  console.log('[MisticPay] Request payload:', JSON.stringify(payload));

  const response = await fetch('https://api.misticpay.com/api/transactions/create', {
    method: 'POST',
    headers: {
      'ci': clientId,
      'cs': clientSecret,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  console.log('[MisticPay] Response:', JSON.stringify(data));

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Erro ao criar pagamento MisticPay');
  }

  const transactionData = data.data;
  
  // Extract base64 from response (may include data:image prefix)
  let pixQrCodeBase64 = transactionData.qrCodeBase64 || null;
  if (pixQrCodeBase64 && pixQrCodeBase64.startsWith('data:image')) {
    pixQrCodeBase64 = pixQrCodeBase64.split(',')[1] || pixQrCodeBase64;
  }

  return {
    gatewayPaymentId: transactionData.transactionId || transactionId,
    pixBrCode: transactionData.copyPaste || null,
    pixQrCodeBase64: pixQrCodeBase64,
    abacatepayUrl: null,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  };
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
    ? 'https://api-sandbox.asaas.com/v3' 
    : 'https://api.asaas.com/v3';

  console.log(`[Asaas] Creating payment via ${sandboxMode ? 'SANDBOX' : 'PRODUCTION'}...`);

  const customerName = `${body.customer.firstName} ${body.customer.lastName}`;
  const customerEmail = body.customer.email || `${cleanCpf}@checkout.local`;
  
  const findCustomerResponse = await fetch(`${baseUrl}/customers?cpfCnpj=${cleanCpf}`, {
    headers: {
      'access_token': ASAAS_API_KEY,
      'Content-Type': 'application/json',
    },
  });
  
  let asaasCustomerId: string;
  const findCustomerData = await findCustomerResponse.json();

  if (findCustomerData.data && findCustomerData.data.length > 0) {
    asaasCustomerId = findCustomerData.data[0].id;
  } else {
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
    if (!createCustomerResponse.ok) {
      throw new Error(createCustomerData.errors?.[0]?.description || 'Erro ao criar cliente no Asaas');
    }
    asaasCustomerId = createCustomerData.id;
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 1);

  const paymentPayload: Record<string, unknown> = {
    customer: asaasCustomerId,
    billingType: body.paymentMethod === 'PIX' ? 'PIX' : 'CREDIT_CARD',
    value: priceCents / 100,
    dueDate: dueDate.toISOString().split('T')[0],
    description: body.description || 'Pagamento',
    externalReference: `checkout-${Date.now()}`,
  };

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
  if (!paymentResponse.ok) {
    throw new Error(paymentData.errors?.[0]?.description || 'Erro ao criar pagamento no Asaas');
  }

  let pixBrCode: string | null = null;
  let pixQrCodeBase64: string | null = null;
  let asaasPaymentId = paymentData.id;
  let abacatepayUrl: string | null = null;

  if (body.paymentMethod === 'PIX') {
    await new Promise(resolve => setTimeout(resolve, 500));

    const pixResponse = await fetch(`${baseUrl}/payments/${asaasPaymentId}/pixQrCode`, {
      headers: {
        'access_token': ASAAS_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    const pixData = await pixResponse.json();
    if (pixResponse.ok) {
      pixBrCode = pixData.payload || null;
      pixQrCodeBase64 = pixData.encodedImage || null;
    }
  } else {
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

    // ============= HYBRID GATEWAY LOGIC =============
    // PIX → MisticPay | CARD → Asaas
    // Fetch ALL configured gateways to enable hybrid routing
    const { data: gatewayConfigs } = await supabase
      .from('checkout_gateway_config')
      .select('*')
      .eq('api_key_configured', true);

    let selectedGateway: string | null = null;
    let apiKey: string | null = null;
    let sandboxMode = false;
    let misticClientId: string | null = null;
    let misticClientSecret: string | null = null;

    // Find MisticPay config (for PIX)
    const misticConfig = gatewayConfigs?.find(c => c.gateway === 'misticpay');
    // Find Asaas config (for CARD)
    const asaasConfig = gatewayConfigs?.find(c => c.gateway === 'asaas');
    // Fallback: AbacatePay
    const abacateConfig = gatewayConfigs?.find(c => c.gateway === 'abacatepay');

    // Hybrid routing based on payment method
    if (body.paymentMethod === 'PIX') {
      // PIX: Prefer MisticPay, fallback to Asaas, then AbacatePay
      if (misticConfig && misticConfig.misticpay_client_id_hash && misticConfig.misticpay_client_secret_hash) {
        selectedGateway = 'misticpay';
        misticClientId = decryptApiKey(misticConfig.misticpay_client_id_hash, misticConfig.user_id);
        misticClientSecret = decryptApiKey(misticConfig.misticpay_client_secret_hash, misticConfig.user_id);
        sandboxMode = misticConfig.sandbox_mode || false;
        console.log('[Hybrid] PIX → MisticPay');
      } else if (asaasConfig && asaasConfig.asaas_access_token_hash) {
        selectedGateway = 'asaas';
        apiKey = decryptApiKey(asaasConfig.asaas_access_token_hash, asaasConfig.user_id);
        sandboxMode = asaasConfig.sandbox_mode || false;
        console.log('[Hybrid] PIX → Asaas (fallback)');
      } else if (abacateConfig) {
        selectedGateway = 'abacatepay';
        apiKey = Deno.env.get('ABACATEPAY_API_KEY') || null;
        console.log('[Hybrid] PIX → AbacatePay (fallback)');
      }
    } else if (body.paymentMethod === 'CARD') {
      // CARD: Prefer Asaas, fallback to AbacatePay
      if (asaasConfig && asaasConfig.asaas_access_token_hash) {
        selectedGateway = 'asaas';
        apiKey = decryptApiKey(asaasConfig.asaas_access_token_hash, asaasConfig.user_id);
        sandboxMode = asaasConfig.sandbox_mode || false;
        console.log('[Hybrid] CARD → Asaas');
      } else if (abacateConfig) {
        selectedGateway = 'abacatepay';
        apiKey = Deno.env.get('ABACATEPAY_API_KEY') || null;
        console.log('[Hybrid] CARD → AbacatePay (fallback)');
      }
    }

    // Fallback to env variables if no DB config
    if (!selectedGateway || (!apiKey && !misticClientId)) {
      const ABACATEPAY_API_KEY = Deno.env.get('ABACATEPAY_API_KEY');
      const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY');
      const ASAAS_SANDBOX = Deno.env.get('ASAAS_SANDBOX') === 'true';

      if (body.paymentMethod === 'PIX' && ASAAS_API_KEY) {
        selectedGateway = 'asaas';
        apiKey = ASAAS_API_KEY;
        sandboxMode = ASAAS_SANDBOX;
      } else if (body.paymentMethod === 'CARD' && ASAAS_API_KEY) {
        selectedGateway = 'asaas';
        apiKey = ASAAS_API_KEY;
        sandboxMode = ASAAS_SANDBOX;
      } else if (ABACATEPAY_API_KEY) {
        selectedGateway = 'abacatepay';
        apiKey = ABACATEPAY_API_KEY;
      }
    }

    console.log('Selected gateway:', selectedGateway, '| Method:', body.paymentMethod, '| Sandbox:', sandboxMode);

    if (!selectedGateway || (!apiKey && !misticClientId)) {
      return new Response(
        JSON.stringify({ error: 'Nenhum gateway configurado para este método de pagamento. Configure MisticPay (PIX) e/ou Asaas (Cartão) em Pagamentos > Gateway.' }),
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
    const webhookUrl = `${supabaseUrl}/functions/v1/checkout-webhook`;

    let paymentResult;

    try {
      if (selectedGateway === 'misticpay') {
        paymentResult = await createMisticPayPayment(
          body, cleanCpf, priceCents, misticClientId!, misticClientSecret!, webhookUrl
        );
      } else if (selectedGateway === 'asaas') {
        paymentResult = await createAsaasPayment(
          body, supabase, origin, cleanCpf, cleanPhone, priceCents, apiKey!, sandboxMode
        );
      } else {
        paymentResult = await createAbacatePayment(
          body, origin, cleanCpf, cleanPhone, priceCents, apiKey!
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
        misticpay_transaction_id: selectedGateway === 'misticpay' ? paymentResult.gatewayPaymentId : null,
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
      source: 'system',
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
