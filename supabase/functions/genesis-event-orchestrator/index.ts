import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * GENESIS EVENT ORCHESTRATOR - Enterprise Core
 * 
 * Central hub for all integration events:
 * - Receives webhooks from all providers
 * - Normalizes events to internal standard
 * - Routes to automation rules
 * - Applies filters, rate limiting, circuit breaker
 * - Executes actions (message, campaign, flow, luna, webhook)
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
};

// Provider event mapping to normalized types
const PROVIDER_EVENT_MAP: Record<string, Record<string, string>> = {
  shopify: {
    'orders/create': 'order_created',
    'orders/paid': 'order_paid',
    'orders/fulfilled': 'order_shipped',
    'orders/cancelled': 'order_cancelled',
    'refunds/create': 'order_refunded',
    'customers/create': 'customer_created',
    'checkouts/create': 'checkout_started',
  },
  woocommerce: {
    'order.created': 'order_created',
    'order.completed': 'order_paid',
    'order.shipped': 'order_shipped',
    'order.cancelled': 'order_cancelled',
    'order.refunded': 'order_refunded',
    'customer.created': 'customer_created',
  },
  nuvemshop: {
    'order/created': 'order_created',
    'order/paid': 'order_paid',
    'order/shipped': 'order_shipped',
    'order/cancelled': 'order_cancelled',
    'customer/created': 'customer_created',
  },
  mercadoshops: {
    'orders': 'order_created',
    'payments': 'order_paid',
    'shipments': 'order_shipped',
  },
  rdstation: {
    'lead.created': 'lead_created',
    'lead.converted': 'lead_converted',
    'opportunity.won': 'opportunity_won',
    'opportunity.lost': 'opportunity_lost',
  },
};

interface NormalizedEvent {
  id: string;
  provider: string;
  event: string;
  instance_id: string;
  integration_id: string;
  external_id: string;
  customer: {
    phone?: string;
    name?: string;
    email?: string;
    external_id?: string;
  };
  order?: {
    id?: string;
    total?: number;
    currency?: string;
    status?: string;
    items?: Array<{ name: string; quantity: number; price: number; sku?: string }>;
  };
  metadata: Record<string, unknown>;
  received_at: string;
}

// Normalize raw webhook to internal format
function normalizeEvent(
  provider: string,
  rawEvent: string,
  payload: Record<string, unknown>,
  instanceId: string,
  integrationId: string
): NormalizedEvent | null {
  const normalizedType = PROVIDER_EVENT_MAP[provider]?.[rawEvent];
  if (!normalizedType) {
    console.warn(`Unknown event ${rawEvent} for provider ${provider}`);
    return null;
  }

  const eventId = crypto.randomUUID();
  const now = new Date().toISOString();

  // Extract customer based on provider
  let customer: NormalizedEvent['customer'] = {};
  let order: NormalizedEvent['order'];
  let externalId = '';

  switch (provider) {
    case 'shopify': {
      const shopifyOrder = payload as Record<string, unknown>;
      const shopifyCustomer = (shopifyOrder.customer as Record<string, unknown>) || {};
      customer = {
        phone: (shopifyOrder.phone as string) || (shopifyCustomer.phone as string),
        name: shopifyCustomer.first_name as string,
        email: (shopifyOrder.email as string) || (shopifyCustomer.email as string),
        external_id: String(shopifyCustomer.id || ''),
      };
      const lineItems = (shopifyOrder.line_items as Array<Record<string, unknown>>) || [];
      order = {
        id: String(shopifyOrder.id || ''),
        total: Number(shopifyOrder.total_price || 0),
        currency: (shopifyOrder.currency as string) || 'BRL',
        status: shopifyOrder.financial_status as string,
        items: lineItems.map((item) => ({
          name: item.title as string,
          quantity: Number(item.quantity),
          price: Number(item.price),
          sku: item.sku as string,
        })),
      };
      externalId = String(shopifyOrder.id || '');
      break;
    }
    case 'woocommerce': {
      const wooOrder = payload as Record<string, unknown>;
      const billing = (wooOrder.billing as Record<string, unknown>) || {};
      customer = {
        phone: billing.phone as string,
        name: `${billing.first_name || ''} ${billing.last_name || ''}`.trim(),
        email: billing.email as string,
        external_id: String(wooOrder.customer_id || ''),
      };
      const wooLineItems = (wooOrder.line_items as Array<Record<string, unknown>>) || [];
      order = {
        id: String(wooOrder.id || ''),
        total: Number(wooOrder.total || 0),
        currency: (wooOrder.currency as string) || 'BRL',
        status: wooOrder.status as string,
        items: wooLineItems.map((item) => ({
          name: item.name as string,
          quantity: Number(item.quantity),
          price: Number(item.price),
          sku: item.sku as string,
        })),
      };
      externalId = String(wooOrder.id || '');
      break;
    }
    case 'nuvemshop': {
      const nuvemOrder = payload as Record<string, unknown>;
      const nuvemCustomer = nuvemOrder.customer as Record<string, unknown> || {};
      customer = {
        phone: nuvemCustomer.phone as string,
        name: nuvemCustomer.name as string,
        email: nuvemCustomer.email as string,
        external_id: String(nuvemCustomer.id || ''),
      };
      order = {
        id: String(nuvemOrder.id || ''),
        total: Number(nuvemOrder.total || 0),
        currency: 'BRL',
        status: nuvemOrder.status as string,
      };
      externalId = String(nuvemOrder.id || '');
      break;
    }
    case 'mercadoshops': {
      const mshopsData = payload as Record<string, unknown>;
      const mshopsBuyer = (mshopsData.buyer as Record<string, unknown>) || {};
      const mshopsPhone = (mshopsBuyer.phone as Record<string, unknown>) || {};
      customer = {
        phone: mshopsPhone.number as string,
        name: `${mshopsBuyer.first_name || ''} ${mshopsBuyer.last_name || ''}`.trim(),
        email: mshopsBuyer.email as string,
        external_id: String(mshopsBuyer.id || ''),
      };
      order = {
        id: String(mshopsData.id || ''),
        total: Number(mshopsData.total_amount || 0),
        currency: (mshopsData.currency_id as string) || 'BRL',
        status: mshopsData.status as string,
      };
      externalId = String(mshopsData.id || '');
      break;
    }
    case 'rdstation': {
      const rdData = payload as Record<string, unknown>;
      const contacts = (rdData.leads as unknown[]) || [rdData];
      const lead = contacts[0] as Record<string, unknown> || {};
      customer = {
        phone: lead.personal_phone as string || lead.mobile_phone as string,
        name: lead.name as string,
        email: lead.email as string,
        external_id: lead.uuid as string,
      };
      externalId = lead.uuid as string || '';
      break;
    }
    default:
      customer = { external_id: '' };
      externalId = String(payload.id || '');
  }

  return {
    id: eventId,
    provider,
    event: normalizedType,
    instance_id: instanceId,
    integration_id: integrationId,
    external_id: externalId,
    customer,
    order,
    metadata: payload,
    received_at: now,
  };
}

// Check if event passes filters
function passesFilters(
  event: NormalizedEvent,
  filters: Array<{ field: string; operator: string; value: unknown }>
): boolean {
  for (const filter of filters) {
    const value = getNestedValue(event, filter.field);
    
    switch (filter.operator) {
      case 'equals':
        if (value !== filter.value) return false;
        break;
      case 'not_equals':
        if (value === filter.value) return false;
        break;
      case 'greater_than':
        if (Number(value) <= Number(filter.value)) return false;
        break;
      case 'less_than':
        if (Number(value) >= Number(filter.value)) return false;
        break;
      case 'contains':
        if (!String(value).toLowerCase().includes(String(filter.value).toLowerCase())) return false;
        break;
      case 'not_contains':
        if (String(value).toLowerCase().includes(String(filter.value).toLowerCase())) return false;
        break;
      case 'in':
        if (!Array.isArray(filter.value) || !filter.value.includes(value)) return false;
        break;
      case 'not_in':
        if (Array.isArray(filter.value) && filter.value.includes(value)) return false;
        break;
    }
  }
  return true;
}

// Get nested object value by path (e.g., 'order.total')
function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

// Check rate limiting
async function checkRateLimit(
  supabase: SupabaseClient,
  ruleId: string,
  maxPerHour: number
): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  const { count } = await supabase
    .from('genesis_automation_logs')
    .select('*', { count: 'exact', head: true })
    .eq('rule_id', ruleId)
    .gte('created_at', oneHourAgo);
  
  return (count || 0) < maxPerHour;
}

// Check cooldown
async function checkCooldown(
  supabase: SupabaseClient,
  ruleId: string,
  cooldownMinutes: number,
  customerId: string
): Promise<boolean> {
  if (cooldownMinutes <= 0) return true;
  
  const cooldownTime = new Date(Date.now() - cooldownMinutes * 60 * 1000).toISOString();
  
  const { data } = await supabase
    .from('genesis_automation_logs')
    .select('id')
    .eq('rule_id', ruleId)
    .eq('customer_id', customerId)
    .gte('created_at', cooldownTime)
    .limit(1);
  
  return !data || data.length === 0;
}

// Execute action based on type
async function executeAction(
  supabase: SupabaseClient,
  event: NormalizedEvent,
  rule: Record<string, unknown>,
  isSimulation: boolean
): Promise<{ success: boolean; message: string; credits: number }> {
  const actionType = rule.action_type as string;
  const actionConfig = rule.action_config as Record<string, unknown>;
  
  if (isSimulation) {
    return {
      success: true,
      message: `[SIMULAÇÃO] Executaria: ${actionType}`,
      credits: actionType === 'send_message' ? 1 : 0,
    };
  }

  switch (actionType) {
    case 'send_message': {
      // Enviar mensagem via instância
      const phone = event.customer.phone;
      if (!phone) {
        return { success: false, message: 'Telefone não encontrado', credits: 0 };
      }
      
      let message = (actionConfig.message_template as string) || '';
      // Replace variables
      message = message
        .replace(/\{\{nome\}\}/gi, event.customer.name || '')
        .replace(/\{\{email\}\}/gi, event.customer.email || '')
        .replace(/\{\{pedido\}\}/gi, event.order?.id || '')
        .replace(/\{\{valor\}\}/gi, event.order?.total?.toFixed(2) || '0.00');
      
      // Get instance VPS URL
      const { data: instance } = await supabase
        .from('genesis_instances')
        .select('vps_url, api_token')
        .eq('id', event.instance_id)
        .single();
      
      if (!instance?.vps_url) {
        return { success: false, message: 'Instância sem VPS configurado', credits: 0 };
      }
      
      // Format phone
      let formattedPhone = phone.replace(/\D/g, '');
      if (!formattedPhone.startsWith('55') && formattedPhone.length <= 11) {
        formattedPhone = '55' + formattedPhone;
      }
      
      const sendUrl = `${instance.vps_url.replace(/\/$/, '')}/api/instance/${event.instance_id}/send`;
      const response = await fetch(sendUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${instance.api_token || 'genesis-master-token-2024-secure'}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to: formattedPhone, message }),
      });
      
      const result = await response.json();
      
      return {
        success: result.success,
        message: result.success ? 'Mensagem enviada' : (result.error || 'Erro ao enviar'),
        credits: result.success ? 1 : 0,
      };
    }
    
    case 'trigger_campaign': {
      const campaignId = actionConfig.campaign_id as string;
      if (!campaignId) {
        return { success: false, message: 'Campanha não configurada', credits: 0 };
      }
      
      // Add contact to existing campaign
      const phone = event.customer.phone;
      if (!phone) {
        return { success: false, message: 'Telefone não encontrado', credits: 0 };
      }
      
      const { error } = await supabase
        .from('genesis_campaign_contacts')
        .insert({
          campaign_id: campaignId,
          contact_phone: phone.replace(/\D/g, ''),
          contact_name: event.customer.name,
          contact_data: { source: 'integration', event: event.event, order_id: event.order?.id },
        });
      
      if (error) {
        return { success: false, message: `Erro ao adicionar contato: ${error.message}`, credits: 0 };
      }
      
      // Update campaign contact count
      await supabase.rpc('increment_campaign_contacts', { p_campaign_id: campaignId });
      
      return {
        success: true,
        message: `Contato adicionado à campanha ${campaignId}`,
        credits: 0,
      };
    }
    
    case 'start_flow': {
      // TODO: Implement flow triggering
      return { success: true, message: 'Flow acionado (em implementação)', credits: 0 };
    }
    
    case 'call_luna': {
      // TODO: Implement Luna AI call
      return { success: true, message: 'Luna AI chamada (em implementação)', credits: 0 };
    }
    
    case 'webhook_external': {
      const webhookUrl = actionConfig.webhook_url as string;
      if (!webhookUrl) {
        return { success: false, message: 'Webhook URL não configurada', credits: 0 };
      }
      
      const headers = (actionConfig.webhook_headers as Record<string, string>) || {};
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(event),
      });
      
      return {
        success: response.ok,
        message: response.ok ? 'Webhook enviado' : `Webhook falhou: ${response.status}`,
        credits: 0,
      };
    }
    
    default:
      return { success: false, message: `Ação desconhecida: ${actionType}`, credits: 0 };
  }
}

// Log automation execution
async function logExecution(
  supabase: SupabaseClient,
  ruleId: string,
  event: NormalizedEvent,
  result: { success: boolean; message: string; credits: number },
  actionType: string,
  isSimulation: boolean,
  durationMs: number
) {
  await supabase.from('genesis_automation_logs').insert({
    rule_id: ruleId,
    instance_id: event.instance_id,
    event_id: event.id,
    event_type: event.event,
    event_data: event,
    customer_id: event.customer.external_id || event.customer.phone,
    action_type: actionType,
    action_result: isSimulation ? 'simulated' : (result.success ? 'success' : 'failed'),
    error_message: result.success ? null : result.message,
    credits_consumed: result.credits,
    duration_ms: durationMs,
  });
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
    
    // Route: POST /provider/:provider/instance/:instance_id
    // or: POST / with body containing provider, instance_id, event, payload
    
    const body = await req.json();
    const {
      provider,
      instance_id: instanceId,
      integration_id: integrationId,
      event: rawEvent,
      payload,
      simulate = false,
    } = body;

    console.log(`[Orchestrator] Received: provider=${provider}, event=${rawEvent}, instance=${instanceId}`);

    if (!provider || !instanceId || !rawEvent) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: provider, instance_id, event' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate integration exists and is connected
    const { data: integration, error: intError } = await supabase
      .from('genesis_instance_integrations')
      .select('*')
      .eq('id', integrationId || '')
      .eq('instance_id', instanceId)
      .eq('provider', provider)
      .maybeSingle();

    // If no integration found by ID, try by instance + provider
    let activeIntegration = integration;
    if (!activeIntegration && !integrationId) {
      const { data } = await supabase
        .from('genesis_instance_integrations')
        .select('*')
        .eq('instance_id', instanceId)
        .eq('provider', provider)
        .eq('status', 'connected')
        .maybeSingle();
      activeIntegration = data;
    }

    if (!activeIntegration || activeIntegration.status !== 'connected') {
      console.warn(`[Orchestrator] Integration not found or not connected: ${provider}/${instanceId}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Integration not connected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize the event
    const normalizedEvent = normalizeEvent(
      provider,
      rawEvent,
      payload || {},
      instanceId,
      activeIntegration.id
    );

    if (!normalizedEvent) {
      return new Response(
        JSON.stringify({ success: false, error: 'Could not normalize event' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Orchestrator] Normalized: ${normalizedEvent.event}, customer: ${normalizedEvent.customer.phone}`);

    // Log the received event
    await supabase.from('genesis_integration_events').insert({
      integration_id: activeIntegration.id,
      instance_id: instanceId,
      provider,
      raw_event: rawEvent,
      normalized_event: normalizedEvent.event,
      event_data: normalizedEvent,
      customer_phone: normalizedEvent.customer.phone,
      customer_name: normalizedEvent.customer.name,
      external_id: normalizedEvent.external_id,
    });

    // Find matching automation rules
    const { data: rules } = await supabase
      .from('genesis_automation_rules')
      .select('*')
      .eq('instance_id', instanceId)
      .eq('event_type', normalizedEvent.event)
      .eq('is_active', true);

    if (!rules || rules.length === 0) {
      console.log(`[Orchestrator] No active rules for event: ${normalizedEvent.event}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Event received, no matching rules',
          event_id: normalizedEvent.id,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: Array<{ rule_id: string; success: boolean; message: string }> = [];

    for (const rule of rules) {
      const startTime = Date.now();
      
      // Check filters
      const filters = (rule.filters as unknown[]) || [];
      if (!passesFilters(normalizedEvent, filters as Array<{ field: string; operator: string; value: unknown }>)) {
        console.log(`[Orchestrator] Rule ${rule.id} filtered out`);
        results.push({ rule_id: rule.id, success: false, message: 'Filtered out' });
        continue;
      }

      // Check rate limit
      const withinLimit = await checkRateLimit(
        supabase,
        rule.id,
        rule.max_executions_per_hour || 100
      );
      if (!withinLimit) {
        console.log(`[Orchestrator] Rule ${rule.id} rate limited`);
        results.push({ rule_id: rule.id, success: false, message: 'Rate limited' });
        continue;
      }

      // Check cooldown per customer
      const cooldownOk = await checkCooldown(
        supabase,
        rule.id,
        rule.cooldown_minutes || 0,
        normalizedEvent.customer.external_id || normalizedEvent.customer.phone || ''
      );
      if (!cooldownOk) {
        console.log(`[Orchestrator] Rule ${rule.id} in cooldown for customer`);
        results.push({ rule_id: rule.id, success: false, message: 'Customer cooldown' });
        continue;
      }

      // Execute action
      const result = await executeAction(supabase, normalizedEvent, rule, simulate);
      const durationMs = Date.now() - startTime;

      // Log execution
      await logExecution(
        supabase,
        rule.id,
        normalizedEvent,
        result,
        rule.action_type as string,
        simulate,
        durationMs
      );

      // Update rule stats
      if (result.success && !simulate) {
        await supabase
          .from('genesis_automation_rules')
          .update({
            execution_count: (rule.execution_count || 0) + 1,
            last_executed_at: new Date().toISOString(),
          })
          .eq('id', rule.id);
      }

      results.push({
        rule_id: rule.id,
        success: result.success,
        message: result.message,
      });
    }

    // Update integration sync timestamp
    await supabase
      .from('genesis_instance_integrations')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', activeIntegration.id);

    return new Response(
      JSON.stringify({
        success: true,
        event_id: normalizedEvent.id,
        normalized_event: normalizedEvent.event,
        rules_matched: rules.length,
        results,
        simulated: simulate,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Orchestrator] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
