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

    // Get webhook secrets
    const webhookSecret = req.headers.get('x-webhook-secret');
    const asaasToken = req.headers.get('asaas-access-token');
    const url = new URL(req.url);
    const querySecret = url.searchParams.get('secret');
    const receivedSecret = webhookSecret || querySecret;
    
    const envSecret = Deno.env.get('ABACATEPAY_WEBHOOK_SECRET');
    const asaasWebhookToken = Deno.env.get('ASAAS_WEBHOOK_TOKEN');

    const { data: webhookConfig } = await supabase
      .from('checkout_webhook_config')
      .select('webhook_secret, is_active')
      .eq('is_active', true)
      .single();

    const validSecret = webhookConfig?.webhook_secret || envSecret;

    // Validate webhook - check both AbacatePay and Asaas tokens
    const isAsaasWebhook = asaasToken || (url.pathname.includes('asaas'));
    
    if (!isAsaasWebhook && validSecret && receivedSecret !== validSecret) {
      console.error('Invalid webhook secret');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (isAsaasWebhook && asaasWebhookToken && asaasToken !== asaasWebhookToken) {
      console.error('Invalid Asaas webhook token');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Webhook secret validated successfully');

    const body = await req.json();
    console.log('Webhook received:', JSON.stringify(body, null, 2));

    // Detect webhook source and extract payment info
    let gateway: 'abacatepay' | 'asaas' = 'abacatepay';
    let paymentId: string | null = null;
    let eventType: string = '';
    let newStatus: string = 'pending';

    // Check if this is an Asaas webhook
    if (body.event && body.payment) {
      gateway = 'asaas';
      paymentId = body.payment.id;
      const asaasEvent = body.event;

      console.log('[Asaas Webhook] Event:', asaasEvent, 'Payment:', paymentId);

      // Map Asaas events to our status
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
          // Just log, no status change
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
    if (gateway === 'asaas') {
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
