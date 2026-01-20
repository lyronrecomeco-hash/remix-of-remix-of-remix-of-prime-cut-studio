import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get webhook secret from headers or query
    const webhookSecret = req.headers.get('x-webhook-secret');
    const url = new URL(req.url);
    const querySecret = url.searchParams.get('secret');
    const receivedSecret = webhookSecret || querySecret;
    
    // Also check environment variable for secret
    const envSecret = Deno.env.get('ABACATEPAY_WEBHOOK_SECRET');

    // Validate webhook secret - check both database config and env variable
    const { data: webhookConfig } = await supabase
      .from('checkout_webhook_config')
      .select('webhook_secret, is_active')
      .eq('is_active', true)
      .single();

    const validSecret = webhookConfig?.webhook_secret || envSecret;
    
    // Only validate if a secret is configured
    if (validSecret && receivedSecret !== validSecret) {
      console.error('Invalid webhook secret. Received:', receivedSecret?.substring(0, 5) + '...');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Webhook secret validated successfully');

    const body = await req.json();
    console.log('Webhook received:', JSON.stringify(body, null, 2));

    // AbacatePay webhook structure
    const { event, data } = body;

    if (!event || !data) {
      console.log('Invalid webhook payload');
      return new Response(
        JSON.stringify({ error: 'Invalid payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find payment by AbacatePay billing ID
    const billingId = data.id || data.billingId;
    if (!billingId) {
      console.log('No billing ID in webhook');
      return new Response(
        JSON.stringify({ received: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: payment, error: paymentError } = await supabase
      .from('checkout_payments')
      .select('id, status, payment_code')
      .eq('abacatepay_billing_id', billingId)
      .single();

    if (paymentError || !payment) {
      console.log('Payment not found for billing:', billingId);
      return new Response(
        JSON.stringify({ received: true, message: 'Payment not found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found payment:', payment.payment_code);

    // Process different webhook events
    let newStatus = payment.status;
    let eventType = event;

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
    }

    // Update payment status if changed
    if (newStatus !== payment.status) {
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
