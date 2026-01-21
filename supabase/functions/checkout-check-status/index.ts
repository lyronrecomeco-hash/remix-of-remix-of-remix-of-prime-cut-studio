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
    const url = new URL(req.url);
    const paymentCode = url.searchParams.get('code');

    if (!paymentCode) {
      return new Response(
        JSON.stringify({ error: 'Payment code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Checking status for payment:', paymentCode);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: payment, error: paymentError } = await supabase
      .from('checkout_payments')
      .select('id, status, paid_at, expires_at, abacatepay_billing_id, asaas_payment_id, misticpay_transaction_id, payment_method, gateway')
      .eq('payment_code', paymentCode)
      .single();

    if (paymentError || !payment) {
      console.error('Payment not found:', paymentError);
      return new Response(
        JSON.stringify({ error: 'Payment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (payment.status === 'paid' || payment.status === 'expired') {
      console.log('Payment already finalized:', payment.status);
      return new Response(
        JSON.stringify({ status: payment.status, paidAt: payment.paid_at }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (payment.expires_at && new Date(payment.expires_at) < new Date()) {
      console.log('Payment expired, updating status');
      await supabase.from('checkout_payments').update({ status: 'expired' }).eq('id', payment.id);
      await supabase.from('checkout_payment_events').insert({
        payment_id: payment.id,
        event_type: 'payment_expired',
        source: 'system',
      });

      return new Response(
        JSON.stringify({ status: 'expired' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
    let misticClientId: string | null = null;
    let misticClientSecret: string | null = null;

    if (activeConfig) {
      sandboxMode = activeConfig.sandbox_mode || false;
      if (activeConfig.gateway === 'misticpay') {
        if (activeConfig.misticpay_client_id_hash && activeConfig.misticpay_client_secret_hash) {
          misticClientId = decryptApiKey(activeConfig.misticpay_client_id_hash, activeConfig.user_id);
          misticClientSecret = decryptApiKey(activeConfig.misticpay_client_secret_hash, activeConfig.user_id);
        }
      } else if (activeConfig.asaas_access_token_hash) {
        apiKey = decryptApiKey(activeConfig.asaas_access_token_hash, activeConfig.user_id);
      }
    } else {
      // Fallback to env variables
      const gateway = payment.gateway || 'abacatepay';
      if (gateway === 'asaas') {
        apiKey = Deno.env.get('ASAAS_API_KEY') || null;
        sandboxMode = Deno.env.get('ASAAS_SANDBOX') === 'true';
      } else {
        apiKey = Deno.env.get('ABACATEPAY_API_KEY') || null;
      }
    }

    // Check with appropriate gateway
    const gateway = payment.gateway || 'abacatepay';
    let isPaid = false;

    if (gateway === 'misticpay' && payment.misticpay_transaction_id && misticClientId && misticClientSecret) {
      try {
        console.log('[MisticPay] Checking payment status:', payment.misticpay_transaction_id);
        
        const misticResponse = await fetch('https://api.misticpay.com/api/transactions/check', {
          method: 'POST',
          headers: {
            'ci': misticClientId,
            'cs': misticClientSecret,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ transactionId: payment.misticpay_transaction_id }),
        });

        if (misticResponse.ok) {
          const misticData = await misticResponse.json();
          console.log('[MisticPay] Status response:', misticData);
          // MisticPay statuses: PENDENTE, COMPLETO, FALHA
          isPaid = misticData.data?.status === 'COMPLETO' || misticData.data?.transactionState === 'COMPLETO';
        }
      } catch (misticError) {
        console.error('[MisticPay] Error checking status:', misticError);
      }
    } else if (gateway === 'asaas' && payment.asaas_payment_id && apiKey) {
      try {
        const baseUrl = sandboxMode 
          ? 'https://api-sandbox.asaas.com/v3' 
          : 'https://api.asaas.com/v3';

        console.log('[Asaas] Checking payment status:', payment.asaas_payment_id);
        
        const asaasResponse = await fetch(`${baseUrl}/payments/${payment.asaas_payment_id}`, {
          headers: {
            'access_token': apiKey,
            'Content-Type': 'application/json',
          },
        });

        if (asaasResponse.ok) {
          const asaasData = await asaasResponse.json();
          console.log('[Asaas] Status response:', asaasData.status);
          isPaid = ['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH'].includes(asaasData.status);
        }
      } catch (asaasError) {
        console.error('[Asaas] Error checking status:', asaasError);
      }
    } else if (gateway === 'abacatepay' && payment.abacatepay_billing_id && apiKey) {
      try {
        console.log('[AbacatePay] Checking status:', payment.abacatepay_billing_id);
        
        let checkUrl = '';
        if (payment.payment_method === 'PIX') {
          checkUrl = `https://api.abacatepay.com/v1/pixQrCode/check?id=${payment.abacatepay_billing_id}`;
        } else {
          checkUrl = `https://api.abacatepay.com/v1/billing/list`;
        }
        
        const abacateResponse = await fetch(checkUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (abacateResponse.ok) {
          const abacateData = await abacateResponse.json();
          console.log('[AbacatePay] Status response:', abacateData);

          if (payment.payment_method === 'PIX') {
            isPaid = abacateData.data?.status === 'PAID' || abacateData.data?.status === 'COMPLETED';
          } else {
            const billings = abacateData.data || [];
            const matchingBilling = billings.find((b: any) => b.id === payment.abacatepay_billing_id);
            isPaid = matchingBilling?.status === 'PAID' || matchingBilling?.status === 'COMPLETED';
          }
        }
      } catch (abacateError) {
        console.error('[AbacatePay] Error checking status:', abacateError);
      }
    }

    if (isPaid) {
      const paidAt = new Date().toISOString();
      
      await supabase
        .from('checkout_payments')
        .update({ status: 'paid', paid_at: paidAt })
        .eq('id', payment.id);

      await supabase.from('checkout_payment_events').insert({
        payment_id: payment.id,
        event_type: 'payment_confirmed',
        event_data: { source: 'polling', gateway },
        source: 'api',
      });

      console.log('Payment confirmed via polling');
      return new Response(
        JSON.stringify({ status: 'paid', paidAt }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ status: payment.status, paidAt: payment.paid_at }),
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
