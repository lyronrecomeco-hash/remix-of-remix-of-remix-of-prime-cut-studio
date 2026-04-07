import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CAKTO_TOKEN_URL = 'https://api.cakto.com.br/public_api/token/';
const CAKTO_ORDERS_URL = 'https://api.cakto.com.br/public_api/orders/';

function decryptApiKey(encrypted: string, userId: string): string {
  const secret = `${userId}-genesis-gateway-2024`;
  const decoded = atob(encrypted);
  let result = '';
  for (let i = 0; i < decoded.length; i++) {
    result += String.fromCharCode(decoded.charCodeAt(i) ^ secret.charCodeAt(i % secret.length));
  }
  return result;
}

async function getCaktoAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const response = await fetch(CAKTO_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    throw new Error(`Falha ao autenticar na Cakto: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function fetchCaktoOrders(accessToken: string, startDate: string, page = 1, limit = 50) {
  const url = new URL(CAKTO_ORDERS_URL);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('created_at__gte', startDate);

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Falha ao consultar pedidos Cakto: ${response.status}`);
  }

  return await response.json() as { next?: string | null; results?: any[] };
}

function parseCaktoAmountToCents(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const numericValue = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  if (!Number.isFinite(numericValue)) return null;
  return Math.round(numericValue * 100);
}

function getCaktoStatus(order: any): 'paid' | 'pending' | 'expired' | 'failed' {
  const status = String(order?.status || '').toLowerCase();
  const paidAt = order?.paidAt || order?.paid_at || null;

  if (paidAt || ['approved', 'paid', 'completed'].includes(status)) return 'paid';
  if (['expired'].includes(status)) return 'expired';
  if (['refused', 'declined', 'failed', 'cancelled', 'canceled'].includes(status)) return 'failed';
  return 'pending';
}

function pickBestCaktoOrderMatch(orders: any[], payment: any, customerEmail?: string | null) {
  if (!orders.length) return null;

  const createdAtMs = payment.created_at ? new Date(payment.created_at).getTime() : null;

  const rankedOrders = orders
    .map((order) => {
      let score = 0;
      const orderId = String(order?.id || '');
      const orderEmail = String(order?.customer?.email || '').toLowerCase();
      const baseAmountCents = parseCaktoAmountToCents(order?.baseAmount ?? order?.offer?.price);
      const totalAmountCents = parseCaktoAmountToCents(order?.amount);
      const orderCreatedAtMs = order?.createdAt ? new Date(order.createdAt).getTime() : null;

      if (payment.cakto_order_id && orderId === payment.cakto_order_id) score += 100;
      if (customerEmail && orderEmail === customerEmail.toLowerCase()) score += 40;
      if (baseAmountCents !== null && payment.amount_cents === baseAmountCents) score += 30;
      if (totalAmountCents !== null && Math.abs(payment.amount_cents - totalAmountCents) <= 100) score += 10;
      if (
        createdAtMs &&
        orderCreatedAtMs &&
        Math.abs(orderCreatedAtMs - createdAtMs) <= 1000 * 60 * 60 * 12
      ) {
        score += 20;
      }

      return { order, score };
    })
    .sort((a, b) => b.score - a.score);

  return rankedOrders[0]?.score > 0 ? rankedOrders[0].order : null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    // Support both GET (?code=...) and POST ({ code })
    let paymentCode = url.searchParams.get('code');
    if (!paymentCode) {
      try {
        const body = await req.json().catch(() => null) as { code?: string } | null;
        if (body?.code) paymentCode = body.code;
      } catch {
        // ignore
      }
    }

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
      .select(`
        id,
        status,
        paid_at,
        expires_at,
        abacatepay_billing_id,
        asaas_payment_id,
        misticpay_transaction_id,
        payment_method,
        gateway,
        amount_cents,
        created_at,
        cakto_order_id,
        customer_id,
        checkout_customers(email)
      `)
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
    let caktoClientId: string | null = null;
    let caktoClientSecret: string | null = null;

    if (activeConfig) {
      sandboxMode = activeConfig.sandbox_mode || false;
      if (payment.gateway === 'cakto' && activeConfig.gateway === 'cakto') {
        if (activeConfig.cakto_client_id_hash && activeConfig.cakto_client_secret_hash) {
          caktoClientId = decryptApiKey(activeConfig.cakto_client_id_hash, activeConfig.user_id);
          caktoClientSecret = decryptApiKey(activeConfig.cakto_client_secret_hash, activeConfig.user_id);
        }
      } else if (activeConfig.gateway === 'misticpay') {
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
      } else if (gateway === 'cakto') {
        const { data: caktoConfig } = await supabase
          .from('checkout_gateway_config')
          .select('*')
          .eq('gateway', 'cakto')
          .eq('is_active', true)
          .eq('api_key_configured', true)
          .maybeSingle();

        if (caktoConfig?.cakto_client_id_hash && caktoConfig?.cakto_client_secret_hash) {
          caktoClientId = decryptApiKey(caktoConfig.cakto_client_id_hash, caktoConfig.user_id);
          caktoClientSecret = decryptApiKey(caktoConfig.cakto_client_secret_hash, caktoConfig.user_id);
        }
      } else {
        apiKey = Deno.env.get('ABACATEPAY_API_KEY') || null;
      }
    }

    // Check with appropriate gateway
    const gateway = payment.gateway || 'abacatepay';
    let isPaid = false;

    let nextStatus: 'paid' | 'pending' | 'expired' | 'failed' | null = null;
    let confirmedPaidAt: string | null = payment.paid_at;

    if (gateway === 'cakto' && caktoClientId && caktoClientSecret) {
      try {
        const customerEmail = ((payment.checkout_customers as { email?: string | null } | null)?.email || '').toLowerCase();
        const startDate = new Date(payment.created_at || new Date().toISOString());
        startDate.setDate(startDate.getDate() - 1);

        const accessToken = await getCaktoAccessToken(caktoClientId, caktoClientSecret);
        const orders: any[] = [];

        for (let page = 1; page <= 3; page++) {
          const result = await fetchCaktoOrders(accessToken, startDate.toISOString().split('T')[0], page, 50);
          orders.push(...(result.results || []));
          if (!result.next) break;
        }

        const matchedOrder = pickBestCaktoOrderMatch(orders, payment, customerEmail);

        if (matchedOrder) {
          nextStatus = getCaktoStatus(matchedOrder);
          confirmedPaidAt = matchedOrder.paidAt || matchedOrder.paid_at || payment.paid_at || null;

          if (matchedOrder.id && payment.cakto_order_id !== matchedOrder.id) {
            await supabase
              .from('checkout_payments')
              .update({ cakto_order_id: matchedOrder.id, updated_at: new Date().toISOString() })
              .eq('id', payment.id);
          }
        }
      } catch (caktoError) {
        console.error('[Cakto] Error checking status:', caktoError);
      }
    } else if (gateway === 'misticpay' && payment.misticpay_transaction_id && misticClientId && misticClientSecret) {
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
          nextStatus = isPaid ? 'paid' : 'pending';
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
          nextStatus = isPaid ? 'paid' : (asaasData.status === 'OVERDUE' ? 'expired' : 'pending');
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
            nextStatus = isPaid ? 'paid' : 'pending';
          } else {
            const billings = abacateData.data || [];
            const matchingBilling = billings.find((b: any) => b.id === payment.abacatepay_billing_id);
            isPaid = matchingBilling?.status === 'PAID' || matchingBilling?.status === 'COMPLETED';
            nextStatus = isPaid ? 'paid' : 'pending';
          }
        }
      } catch (abacateError) {
        console.error('[AbacatePay] Error checking status:', abacateError);
      }
    }

    if (!nextStatus && isPaid) {
      nextStatus = 'paid';
    }

    if (nextStatus === 'paid') {
      const paidAt = confirmedPaidAt || new Date().toISOString();
      
      await supabase
        .from('checkout_payments')
        .update({ status: 'paid', paid_at: paidAt })
        .eq('id', payment.id);

      await supabase.from('checkout_payment_events').insert({
        payment_id: payment.id,
        event_type: 'payment_confirmed',
        event_data: { source: 'polling', gateway },
        source: 'polling',
      });

      console.log('Payment confirmed via polling');
      return new Response(
        JSON.stringify({ status: 'paid', paidAt }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (nextStatus && nextStatus !== payment.status && nextStatus !== 'pending') {
      await supabase
        .from('checkout_payments')
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', payment.id);

      await supabase.from('checkout_payment_events').insert({
        payment_id: payment.id,
        event_type: nextStatus === 'expired' ? 'payment_expired' : 'payment_failed',
        event_data: { source: 'polling', gateway },
        source: 'polling',
      });

      return new Response(
        JSON.stringify({ status: nextStatus, paidAt: confirmedPaidAt }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ status: nextStatus || payment.status, paidAt: confirmedPaidAt || payment.paid_at }),
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
