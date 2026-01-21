import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const { data: oldPayment, error: paymentError } = await supabase
      .from('checkout_payments')
      .select(`*, customer:checkout_customers(*)`)
      .eq('payment_code', paymentCode)
      .single();

    if (paymentError || !oldPayment) {
      console.error('Payment not found:', paymentError);
      return new Response(
        JSON.stringify({ error: 'Payment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Get active gateway config from database
    const { data: activeConfig } = await supabase
      .from('checkout_gateway_config')
      .select('*')
      .eq('is_active', true)
      .eq('api_key_configured', true)
      .single();

    let apiKey: string | null = null;
    let sandboxMode = false;
    let gateway = oldPayment.gateway || 'abacatepay';

    if (activeConfig && activeConfig.asaas_access_token_hash) {
      apiKey = decryptApiKey(activeConfig.asaas_access_token_hash, activeConfig.user_id);
      sandboxMode = activeConfig.sandbox_mode || false;
      gateway = activeConfig.gateway;
    } else {
      // Fallback to env variables
      if (gateway === 'asaas') {
        apiKey = Deno.env.get('ASAAS_API_KEY') || null;
        sandboxMode = Deno.env.get('ASAAS_SANDBOX') === 'true';
      } else {
        apiKey = Deno.env.get('ABACATEPAY_API_KEY') || null;
      }
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured. Configure em Pagamentos > Gateway.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let pixBrCode: string | null = null;
    let pixQrCodeBase64: string | null = null;
    let abacatepayBillingId: string | null = null;
    let asaasPaymentId: string | null = null;

    if (oldPayment.payment_method === 'PIX') {
      if (gateway === 'asaas') {
        // Regenerate via Asaas
        const baseUrl = sandboxMode 
          ? 'https://api-sandbox.asaas.com/v3' 
          : 'https://api.asaas.com/v3';

        console.log('[Asaas] Regenerating PIX payment...');

        // Find or get customer
        const findCustomerResponse = await fetch(`${baseUrl}/customers?cpfCnpj=${customer.cpf}`, {
          headers: {
            'access_token': apiKey,
            'Content-Type': 'application/json',
          },
        });
        
        const findCustomerData = await findCustomerResponse.json();
        let asaasCustomerId: string;

        if (findCustomerData.data && findCustomerData.data.length > 0) {
          asaasCustomerId = findCustomerData.data[0].id;
        } else {
          const createCustomerResponse = await fetch(`${baseUrl}/customers`, {
            method: 'POST',
            headers: {
              'access_token': apiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: `${customer.first_name} ${customer.last_name}`,
              email: customer.email || `${customer.cpf}@checkout.local`,
              phone: `${customer.phone_country_code}${customer.phone}`,
              cpfCnpj: customer.cpf,
              notificationDisabled: true,
            }),
          });
          const createCustomerData = await createCustomerResponse.json();
          asaasCustomerId = createCustomerData.id;
        }

        // Create new payment
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 1);

        const paymentResponse = await fetch(`${baseUrl}/payments`, {
          method: 'POST',
          headers: {
            'access_token': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customer: asaasCustomerId,
            billingType: 'PIX',
            value: oldPayment.amount_cents / 100,
            dueDate: dueDate.toISOString().split('T')[0],
            description: oldPayment.description || 'Pagamento',
            externalReference: `checkout-regen-${Date.now()}`,
          }),
        });

        const paymentData = await paymentResponse.json();
        
        if (!paymentResponse.ok) {
          throw new Error(paymentData.errors?.[0]?.description || 'Erro ao regenerar pagamento');
        }

        asaasPaymentId = paymentData.id;

        // Get PIX QR Code
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const pixResponse = await fetch(`${baseUrl}/payments/${asaasPaymentId}/pixQrCode`, {
          headers: {
            'access_token': apiKey,
            'Content-Type': 'application/json',
          },
        });

        if (pixResponse.ok) {
          const pixData = await pixResponse.json();
          pixBrCode = pixData.payload || null;
          pixQrCodeBase64 = pixData.encodedImage || null;
        }

      } else {
        // Regenerate via AbacatePay
        console.log('[AbacatePay] Regenerating PIX...');
        
        const pixPayload = {
          amount: oldPayment.amount_cents,
          expiresIn: 600,
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
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pixPayload),
        });

        const pixData = await pixResponse.json();

        if (!pixResponse.ok) {
          return new Response(
            JSON.stringify({ error: pixData.error || 'Erro ao gerar QR Code PIX' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        abacatepayBillingId = pixData.data?.id || null;
        pixBrCode = pixData.data?.brCode || null;
        const rawBase64 = pixData.data?.brCodeBase64 || pixData.data?.qrCodeBase64 || null;
        if (rawBase64 && rawBase64.startsWith('data:image')) {
          pixQrCodeBase64 = rawBase64.split(',')[1] || rawBase64;
        } else {
          pixQrCodeBase64 = rawBase64;
        }
      }
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const newPaymentCode = abacatepayBillingId || asaasPaymentId || 
      `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const { data: newPayment, error: newPaymentError } = await supabase
      .from('checkout_payments')
      .insert({
        payment_code: newPaymentCode,
        customer_id: customer.id,
        amount_cents: oldPayment.amount_cents,
        description: oldPayment.description,
        payment_method: oldPayment.payment_method,
        gateway: gateway,
        abacatepay_billing_id: abacatepayBillingId,
        asaas_payment_id: asaasPaymentId,
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

    await supabase.from('checkout_payment_events').insert({
      payment_id: oldPayment.id,
      event_type: 'payment_regenerated',
      event_data: { new_payment_code: newPayment.payment_code, gateway },
      source: 'manual',
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
