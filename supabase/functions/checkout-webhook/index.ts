import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret, asaas-access-token',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get webhook secrets from headers and query
    const webhookSecret = req.headers.get('x-webhook-secret');
    const asaasToken = req.headers.get('asaas-access-token');
    const url = new URL(req.url);
    const querySecret = url.searchParams.get('secret');
    const receivedSecret = webhookSecret || querySecret;
    
    // Get webhook config from database
    const { data: webhookConfig } = await supabase
      .from('checkout_webhook_config')
      .select('webhook_secret, is_active')
      .eq('is_active', true)
      .single();

    // Get gateway config for webhook token validation
    const { data: gatewayConfig } = await supabase
      .from('checkout_gateway_config')
      .select('webhook_secret, gateway')
      .eq('is_active', true)
      .single();

    const validAbacateSecret = webhookConfig?.webhook_secret || Deno.env.get('ABACATEPAY_WEBHOOK_SECRET');
    const validAsaasToken = gatewayConfig?.webhook_secret || Deno.env.get('ASAAS_WEBHOOK_TOKEN');

    const body = await req.json();
    console.log('Webhook received:', JSON.stringify(body, null, 2));

    // Detect webhook source and extract payment info
    let gateway: 'abacatepay' | 'asaas' | 'misticpay' = 'abacatepay';
    let paymentId: string | null = null;
    let eventType: string = '';
    let newStatus: string = 'pending';

    // Check if this is a MisticPay webhook (has transactionId, transactionType, and transactionMethod)
    if (body.transactionId && body.transactionType && body.transactionMethod === 'PIX') {
      gateway = 'misticpay';
      paymentId = String(body.transactionId);
      const misticStatus = body.status;

      console.log('[MisticPay Webhook] Status:', misticStatus, 'TransactionId:', paymentId);

      switch (misticStatus) {
        case 'COMPLETO':
          newStatus = 'paid';
          eventType = 'payment_confirmed';
          break;
        case 'FALHA':
          newStatus = 'failed';
          eventType = 'payment_failed';
          break;
        case 'PENDENTE':
        default:
          eventType = 'payment_pending';
      }
    }
    // Check if this is an Asaas webhook (has event and payment object)
    else if (body.event && body.payment) {
      gateway = 'asaas';
      paymentId = body.payment.id;
      const asaasEvent = body.event;

      // Validate Asaas token if configured
      if (validAsaasToken && asaasToken && asaasToken !== validAsaasToken) {
        console.error('Invalid Asaas webhook token');
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[Asaas Webhook] Event:', asaasEvent, 'Payment:', paymentId);

      switch (asaasEvent) {
        case 'PAYMENT_RECEIVED':
        case 'PAYMENT_CONFIRMED':
          newStatus = 'paid';
          eventType = 'payment_confirmed';
          break;
        case 'PAYMENT_OVERDUE':
          newStatus = 'expired';
          eventType = 'payment_expired';
          break;
        case 'PAYMENT_DELETED':
        case 'PAYMENT_REFUNDED':
          newStatus = 'refunded';
          eventType = 'payment_refunded';
          break;
        case 'PAYMENT_ANTICIPATED':
        case 'PAYMENT_CREATED':
        case 'PAYMENT_UPDATED':
          eventType = asaasEvent.toLowerCase();
          break;
        default:
          console.log('Unhandled Asaas event:', asaasEvent);
          eventType = asaasEvent.toLowerCase();
      }
    } else {
      // AbacatePay webhook format
      const { event, data } = body;
      gateway = 'abacatepay';
      paymentId = data?.id || data?.billingId;

      // Validate AbacatePay secret if configured
      if (validAbacateSecret && receivedSecret !== validAbacateSecret) {
        console.error('Invalid AbacatePay webhook secret');
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!event || !data) {
        console.log('Invalid webhook payload');
        return new Response(
          JSON.stringify({ error: 'Invalid payload' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[AbacatePay Webhook] Event:', event, 'BillingId:', paymentId);

      switch (event) {
        case 'billing.paid':
        case 'payment.confirmed':
        case 'BILLING_PAID':
          newStatus = 'paid';
          eventType = 'payment_confirmed';
          break;
        case 'billing.expired':
        case 'payment.expired':
        case 'BILLING_EXPIRED':
          newStatus = 'expired';
          eventType = 'payment_expired';
          break;
        case 'billing.failed':
        case 'payment.failed':
        case 'BILLING_FAILED':
          newStatus = 'failed';
          eventType = 'payment_failed';
          break;
        case 'billing.refunded':
        case 'payment.refunded':
        case 'BILLING_REFUNDED':
          newStatus = 'refunded';
          eventType = 'payment_refunded';
          break;
        default:
          console.log('Unhandled event type:', event);
          eventType = event;
      }
    }

    if (!paymentId) {
      console.log('No payment ID in webhook');
      return new Response(
        JSON.stringify({ received: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find payment by gateway-specific ID
    let payment;
    if (gateway === 'misticpay') {
      // MisticPay uses transactionId - search by misticpay_transaction_id or payment_code containing the ID
      const { data, error } = await supabase
        .from('checkout_payments')
        .select('id, status, payment_code')
        .or(`misticpay_transaction_id.eq.${paymentId},payment_code.ilike.%${paymentId}%`)
        .single();
      payment = data;
      if (error) console.log('Payment lookup error:', error);
    } else if (gateway === 'asaas') {
      const { data, error } = await supabase
        .from('checkout_payments')
        .select('id, status, payment_code')
        .eq('asaas_payment_id', paymentId)
        .single();
      payment = data;
      if (error) console.log('Payment lookup error:', error);
    } else {
      const { data, error } = await supabase
        .from('checkout_payments')
        .select('id, status, payment_code')
        .eq('abacatepay_billing_id', paymentId)
        .single();
      payment = data;
      if (error) console.log('Payment lookup error:', error);
    }

    if (!payment) {
      console.log('Payment not found for:', paymentId);
      return new Response(
        JSON.stringify({ received: true, message: 'Payment not found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found payment:', payment.payment_code);

    // Update payment status if changed
    if (newStatus !== 'pending' && newStatus !== payment.status) {
      const updateData: Record<string, unknown> = { status: newStatus };
      
      if (newStatus === 'paid') {
        updateData.paid_at = new Date().toISOString();
      }

      await supabase
        .from('checkout_payments')
        .update(updateData)
        .eq('id', payment.id);

      console.log('Updated payment status to:', newStatus);
    }

    // Log webhook event
    await supabase.from('checkout_payment_events').insert({
      payment_id: payment.id,
      event_type: eventType,
      event_data: body,
      source: 'webhook',
    });

    // Update webhook config last received
    if (webhookConfig) {
      await supabase
        .from('checkout_webhook_config')
        .update({ last_received_at: new Date().toISOString() })
        .eq('webhook_secret', webhookConfig.webhook_secret);
    }

    console.log('Webhook processed successfully');

    return new Response(
      JSON.stringify({ received: true, status: newStatus }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});