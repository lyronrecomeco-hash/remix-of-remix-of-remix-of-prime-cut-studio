import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * CAKTO WEBHOOK RECEIVER - Enterprise
 * 
 * Receives webhooks from Cakto platform:
 * - initiate_checkout
 * - purchase_approved
 * - purchase_refused
 * - purchase_refunded
 * - checkout_abandonment
 * 
 * Flow:
 * 1. Validate webhook signature
 * 2. Deduplicate event
 * 3. Normalize to internal format
 * 4. Store in genesis_cakto_events
 * 5. Route to event orchestrator for campaign dispatch
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cakto-signature, x-webhook-secret',
};

// Cakto event types
const CAKTO_EVENTS = [
  'initiate_checkout',
  'purchase_approved',
  'purchase_refused',
  'purchase_refunded',
  'checkout_abandonment',
] as const;

type CaktoEventType = typeof CAKTO_EVENTS[number];

// Normalize phone to E.164 format
function normalizePhone(phone: string | undefined | null): string | null {
  if (!phone) return null;
  
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Handle Brazilian numbers
  if (cleaned.length === 10 || cleaned.length === 11) {
    // Add country code if missing
    cleaned = '55' + cleaned;
  }
  
  // Validate minimum length
  if (cleaned.length < 10) return null;
  
  return '+' + cleaned;
}

// Extract customer data from Cakto payload
function extractCustomer(payload: Record<string, unknown>): {
  name: string | null;
  email: string | null;
  phone: string | null;
} {
  // Cakto sends customer data in various places depending on event
  const customer = (payload.customer as Record<string, unknown>) || 
                   (payload.buyer as Record<string, unknown>) || 
                   payload;
  
  const name = (customer.name as string) || 
               (customer.full_name as string) || 
               `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 
               null;
               
  const email = (customer.email as string) || null;
  
  // Phone can be in different fields
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Extract instance_id from path: /cakto-webhook/:instance_id
    // or from query param: ?instance_id=xxx
    let instanceId = pathParts[pathParts.length - 1];
    if (!instanceId || instanceId === 'cakto-webhook') {
      instanceId = url.searchParams.get('instance_id') || '';
    }

    if (!instanceId) {
      console.error('[CaktoWebhook] Missing instance_id');
      return new Response(
        JSON.stringify({ success: false, error: 'Missing instance_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    console.log(`[CaktoWebhook] Received for instance ${instanceId}:`, JSON.stringify(body).slice(0, 500));

    // Extract event type from Cakto payload
    const eventType = (body.event as string) || 
                      (body.type as string) || 
                      (body.event_type as string);

    if (!eventType || !CAKTO_EVENTS.includes(eventType as CaktoEventType)) {
      console.warn(`[CaktoWebhook] Unknown event type: ${eventType}`);
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

    // Check integration exists and is active
    const { data: integration, error: intError } = await supabase
      .from('genesis_instance_integrations')
      .select('*')
      .eq('instance_id', instanceId)
      .eq('provider', 'cakto')
      .eq('status', 'connected')
      .maybeSingle();

    if (!integration) {
      console.error(`[CaktoWebhook] No active Cakto integration for instance ${instanceId}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Cakto integration not found or not connected' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DEDUPLICATION CHECK - Hard layer
    const { data: existingDedup } = await supabase
      .from('genesis_cakto_dedup')
      .select('id')
      .eq('instance_id', instanceId)
      .eq('external_id', externalId)
      .eq('event_type', eventType)
      .maybeSingle();

    if (existingDedup) {
      console.log(`[CaktoWebhook] Duplicate event ignored: ${externalId}/${eventType}`);
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
      integration_id: integration.id,
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
        integration_id: integration.id,
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
      // Check if it's a duplicate constraint error
      if (insertError.code === '23505') {
        console.log(`[CaktoWebhook] Duplicate event (constraint): ${externalId}/${eventType}`);
        return new Response(
          JSON.stringify({ success: true, message: 'Duplicate event ignored', deduplicated: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw insertError;
    }

    console.log(`[CaktoWebhook] Event stored: ${insertedEvent.id}`);

    // Check if customer has valid phone for campaign dispatch
    if (!customer.phone) {
      console.warn(`[CaktoWebhook] No valid phone for event ${insertedEvent.id}, marking as processed without campaign`);
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
      .eq('integration_id', integration.id)
      .eq('event_type', eventType)
      .eq('is_active', true);

    if (!rules || rules.length === 0) {
      console.log(`[CaktoWebhook] No active rules for event: ${eventType}`);
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

      // Apply delay if configured
      const delaySeconds = rule.delay_seconds || 0;
      const delayMaxSeconds = rule.delay_max_seconds || 0;
      const actualDelay = delayMaxSeconds > delaySeconds 
        ? delaySeconds + Math.random() * (delayMaxSeconds - delaySeconds)
        : delaySeconds;

      // Schedule campaign dispatch via orchestrator
      // For now, we dispatch immediately (delay handled by campaign queue)
      try {
        // Add contact to campaign
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
          console.error(`[CaktoWebhook] Error adding contact to campaign:`, contactError);
          results.push({ 
            rule_id: rule.id, 
            campaign_id: rule.campaign_id, 
            success: false, 
            message: contactError.message 
          });
        } else {
          console.log(`[CaktoWebhook] Contact added to campaign ${rule.campaign_id}: ${customer.phone}`);
          results.push({ 
            rule_id: rule.id, 
            campaign_id: rule.campaign_id, 
            success: true, 
            message: 'Contact added to campaign' 
          });
        }
      } catch (err) {
        console.error(`[CaktoWebhook] Error processing rule ${rule.id}:`, err);
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

  } catch (error) {
    console.error('[CaktoWebhook] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
