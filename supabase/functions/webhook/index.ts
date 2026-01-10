import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * UNIVERSAL WEBHOOK GATEWAY
 * 
 * URL: https://genesishub.cloud/webhook/{provider}/{integration_id}
 * 
 * Supports:
 * - /webhook/cakto/{integration_id} - Cakto webhooks
 * - /webhook/stripe/{integration_id} - Stripe webhooks (future)
 * - /webhook/hotmart/{integration_id} - Hotmart webhooks (future)
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cakto-signature, x-webhook-secret, x-signature, x-signature-256',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
};

// Cakto event types - Todos os eventos suportados pela Cakto
// https://docs.cakto.com.br/
const CAKTO_EVENTS = [
  'initiate_checkout',
  'pix_generated',
  'pix_expired',
  'purchase_approved',
  'purchase_refused',
  'purchase_refunded',
  'purchase_chargeback',
  'checkout_abandonment',
] as const;

type CaktoEventType = typeof CAKTO_EVENTS[number];

// Normalize phone to E.164 format
function normalizePhone(phone: string | undefined | null): string | null {
  if (!phone) return null;
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10 || cleaned.length === 11) {
    cleaned = '55' + cleaned;
  }
  if (cleaned.length < 10) return null;
  return '+' + cleaned;
}

// Extract customer data from Cakto payload
function extractCustomer(payload: Record<string, unknown>): {
  name: string | null;
  email: string | null;
  phone: string | null;
} {
  const customer = (payload.customer as Record<string, unknown>) || 
                   (payload.buyer as Record<string, unknown>) || 
                   payload;
  
  const name = (customer.name as string) || 
               (customer.full_name as string) || 
               `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 
               null;
               
  const email = (customer.email as string) || null;
  
  const rawPhone = (customer.phone as string) || 
                   (customer.cellphone as string) || 
                   (customer.mobile as string) ||
                   (customer.whatsapp as string) ||
                   ((customer.phone_number as Record<string, unknown>)?.number as string) ||
                   null;
  
  const phone = normalizePhone(rawPhone);
  
  return { name, email, phone };
}

// Extract product/offer data
function extractProductOffer(payload: Record<string, unknown>): {
  productId: string | null;
  productName: string | null;
  offerId: string | null;
  offerName: string | null;
  orderValue: number | null;
  currency: string;
} {
  const product = (payload.product as Record<string, unknown>) || {};
  const offer = (payload.offer as Record<string, unknown>) || {};
  const order = (payload.order as Record<string, unknown>) || payload;
  
  return {
    productId: (product.id as string) || (product.external_id as string) || null,
    productName: (product.name as string) || (product.title as string) || null,
    offerId: (offer.id as string) || (offer.external_id as string) || null,
    offerName: (offer.name as string) || (offer.title as string) || null,
    orderValue: Number(order.total || order.amount || order.value || 0) || null,
    currency: (order.currency as string) || 'BRL',
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Parse path: /webhook/{provider}/{integration_id}
    // or direct: /{provider}/{integration_id}
    let provider = '';
    let integrationId = '';
    
    // Handle different path structures
    if (pathParts.includes('webhook')) {
      const webhookIndex = pathParts.indexOf('webhook');
      provider = pathParts[webhookIndex + 1] || '';
      integrationId = pathParts[webhookIndex + 2] || '';
    } else if (pathParts.length >= 2) {
      // Direct: /cakto/{integration_id}
      provider = pathParts[0];
      integrationId = pathParts[1];
    } else if (pathParts.length === 1) {
      // Just integration_id, assume cakto
      provider = 'cakto';
      integrationId = pathParts[0];
    }

    // Also check query params as fallback
    if (!integrationId) {
      integrationId = url.searchParams.get('integration_id') || url.searchParams.get('id') || '';
    }
    if (!provider) {
      provider = url.searchParams.get('provider') || 'cakto';
    }

    console.log(`[Webhook] Provider: ${provider}, Integration: ${integrationId}`);

    if (!integrationId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing integration_id in path' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle based on provider
    if (provider === 'cakto') {
      return await handleCaktoWebhook(req, supabase, integrationId);
    }

    // Unknown provider
    return new Response(
      JSON.stringify({ success: false, error: `Unknown provider: ${provider}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[Webhook] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Handle Cakto webhooks
async function handleCaktoWebhook(req: Request, supabase: any, integrationId: string) {
  const body = await req.json();
  console.log(`[Webhook/Cakto] Received for integration ${integrationId}:`, JSON.stringify(body).slice(0, 500));

  // Find integration by ID
  const { data: integration, error: intError } = await supabase
    .from('genesis_instance_integrations')
    .select('*, instance:genesis_instances(id, name, user_id)')
    .eq('id', integrationId)
    .eq('provider', 'cakto')
    .maybeSingle();

  if (!integration) {
    console.error(`[Webhook/Cakto] Integration not found: ${integrationId}`);
    return new Response(
      JSON.stringify({ success: false, error: 'Integration not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (integration.status !== 'connected') {
    console.error(`[Webhook/Cakto] Integration not connected: ${integrationId}`);
    return new Response(
      JSON.stringify({ success: false, error: 'Integration not connected' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const instanceId = integration.instance_id;

  // Extract event type
  const eventType = (body.event as string) || 
                    (body.type as string) || 
                    (body.event_type as string);

  if (!eventType || !CAKTO_EVENTS.includes(eventType as CaktoEventType)) {
    console.warn(`[Webhook/Cakto] Unknown event type: ${eventType}`);
    return new Response(
      JSON.stringify({ success: false, error: `Unknown event type: ${eventType}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Extract external_id for deduplication
  const externalId = (body.id as string) || 
                     (body.transaction_id as string) || 
                     (body.order_id as string) ||
                     (body.checkout_id as string) ||
                     crypto.randomUUID();

  // DEDUPLICATION CHECK
  const { data: existingDedup } = await supabase
    .from('genesis_cakto_dedup')
    .select('id')
    .eq('instance_id', instanceId)
    .eq('external_id', externalId)
    .eq('event_type', eventType)
    .maybeSingle();

  if (existingDedup) {
    console.log(`[Webhook/Cakto] Duplicate event ignored: ${externalId}/${eventType}`);
    return new Response(
      JSON.stringify({ success: true, message: 'Duplicate event ignored', deduplicated: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Extract customer and product data
  const customer = extractCustomer(body);
  const productOffer = extractProductOffer(body);

  // Create normalized event
  const normalizedEvent = {
    provider: 'cakto',
    event: eventType,
    instance_id: instanceId,
    integration_id: integrationId,
    external_id: externalId,
    customer: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    },
    order: {
      id: externalId,
      total: productOffer.orderValue,
      currency: productOffer.currency,
    },
    product: {
      id: productOffer.productId,
      name: productOffer.productName,
    },
    offer: {
      id: productOffer.offerId,
      name: productOffer.offerName,
    },
    metadata: body,
    received_at: new Date().toISOString(),
  };

  // Insert into dedup table
  await supabase.from('genesis_cakto_dedup').insert({
    instance_id: instanceId,
    external_id: externalId,
    event_type: eventType,
    customer_phone: customer.phone,
  });

  // Insert event into cakto_events table
  const { data: insertedEvent, error: insertError } = await supabase
    .from('genesis_cakto_events')
    .insert({
      instance_id: instanceId,
      integration_id: integrationId,
      event_type: eventType,
      external_id: externalId,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      product_id: productOffer.productId,
      product_name: productOffer.productName,
      offer_id: productOffer.offerId,
      offer_name: productOffer.offerName,
      order_value: productOffer.orderValue,
      currency: productOffer.currency,
      raw_payload: body,
      normalized_event: normalizedEvent,
      processed: false,
    })
    .select()
    .single();

  if (insertError) {
    if (insertError.code === '23505') {
      console.log(`[Webhook/Cakto] Duplicate event (constraint): ${externalId}/${eventType}`);
      return new Response(
        JSON.stringify({ success: true, message: 'Duplicate event ignored', deduplicated: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    throw insertError;
  }

  console.log(`[Webhook/Cakto] Event stored: ${insertedEvent.id}`);

  // Check if customer has valid phone for campaign dispatch
  if (!customer.phone) {
    console.warn(`[Webhook/Cakto] No valid phone for event ${insertedEvent.id}`);
    await supabase
      .from('genesis_cakto_events')
      .update({ 
        processed: true, 
        processed_at: new Date().toISOString(),
        error_message: 'No valid phone number found',
      })
      .eq('id', insertedEvent.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Event received but no valid phone for dispatch',
        event_id: insertedEvent.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Find matching rule for this event
  const { data: rules } = await supabase
    .from('genesis_cakto_event_rules')
    .select('*, campaign:genesis_campaigns(*)')
    .eq('instance_id', instanceId)
    .eq('integration_id', integrationId)
    .eq('event_type', eventType)
    .eq('is_active', true);

  if (!rules || rules.length === 0) {
    console.log(`[Webhook/Cakto] No active rules for event: ${eventType}`);
    await supabase
      .from('genesis_cakto_events')
      .update({ 
        processed: true, 
        processed_at: new Date().toISOString(),
        error_message: 'No active rules configured',
      })
      .eq('id', insertedEvent.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Event received, no matching rules',
        event_id: insertedEvent.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Process each matching rule
  const results: Array<{ rule_id: string; campaign_id: string | null; success: boolean; message: string }> = [];

  for (const rule of rules) {
    if (!rule.campaign_id) {
      results.push({ rule_id: rule.id, campaign_id: null, success: false, message: 'No campaign configured' });
      continue;
    }

    const delaySeconds = rule.delay_seconds || 0;
    const delayMaxSeconds = rule.delay_max_seconds || 0;
    const actualDelay = delayMaxSeconds > delaySeconds 
      ? delaySeconds + Math.random() * (delayMaxSeconds - delaySeconds)
      : delaySeconds;

    try {
      const { error: contactError } = await supabase
        .from('genesis_campaign_contacts')
        .upsert({
          campaign_id: rule.campaign_id,
          phone: customer.phone,
          name: customer.name || 'Cliente Cakto',
          status: 'pending',
          metadata: {
            source: 'cakto',
            event_type: eventType,
            event_id: insertedEvent.id,
            order_value: productOffer.orderValue,
            product_name: productOffer.productName,
            offer_name: productOffer.offerName,
            delay_applied: actualDelay,
          },
        }, {
          onConflict: 'campaign_id,phone',
        });

      if (contactError) {
        console.error(`[Webhook/Cakto] Error adding contact to campaign:`, contactError);
        results.push({ 
          rule_id: rule.id, 
          campaign_id: rule.campaign_id, 
          success: false, 
          message: contactError.message 
        });
      } else {
        console.log(`[Webhook/Cakto] Contact added to campaign ${rule.campaign_id}: ${customer.phone}`);
        results.push({ 
          rule_id: rule.id, 
          campaign_id: rule.campaign_id, 
          success: true, 
          message: 'Contact added to campaign' 
        });
      }
    } catch (err) {
      console.error(`[Webhook/Cakto] Error processing rule ${rule.id}:`, err);
      results.push({ 
        rule_id: rule.id, 
        campaign_id: rule.campaign_id, 
        success: false, 
        message: String(err) 
      });
    }
  }

  // Update event as processed
  const successfulRules = results.filter(r => r.success);
  await supabase
    .from('genesis_cakto_events')
    .update({ 
      processed: true, 
      processed_at: new Date().toISOString(),
      campaign_triggered_id: successfulRules[0]?.campaign_id || null,
      error_message: successfulRules.length === 0 ? 'All rules failed' : null,
    })
    .eq('id', insertedEvent.id);

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: `Event processed with ${successfulRules.length}/${rules.length} successful rules`,
      event_id: insertedEvent.id,
      results,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
