import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature, x-signature-256, x-hub-signature-256, x-webhook-secret',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
};

interface WebhookConfig {
  id: string;
  user_id: string;
  flow_id: string | null;
  webhook_id: string;
  name: string;
  secret_key: string | null;
  auth_type: string;
  auth_config: Record<string, any>;
  rate_limit_per_minute: number;
  rate_limit_per_hour: number;
  dedup_enabled: boolean;
  dedup_window_seconds: number;
  dedup_field: string;
  custom_response_enabled: boolean;
  custom_response: { status: number; body: any };
  is_active: boolean;
}

// HMAC signature verification
async function verifyHmacSignature(
  payload: string,
  signature: string,
  secret: string,
  algorithm: string = 'sha256'
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: algorithm.toUpperCase().replace('SHA', 'SHA-') },
      false,
      ['sign']
    );
    
    const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const computedSignature = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Handle different signature formats (sha256=xxx, xxx, etc.)
    const cleanSignature = signature.replace(/^sha256=/, '').replace(/^sha1=/, '');
    
    return computedSignature === cleanSignature;
  } catch (error) {
    console.error('HMAC verification error:', error);
    return false;
  }
}

// Validate authentication
async function validateAuth(
  config: WebhookConfig,
  headers: Headers,
  sourceIp: string,
  bodyRaw: string
): Promise<{ valid: boolean; reason?: string }> {
  const authConfig = config.auth_config || {};
  
  switch (config.auth_type) {
    case 'none':
      return { valid: true };
      
    case 'token': {
      const headerName = authConfig.token_header || 'Authorization';
      const expectedToken = authConfig.expected_token || config.secret_key;
      const receivedToken = headers.get(headerName);
      
      if (!receivedToken || receivedToken.replace('Bearer ', '') !== expectedToken) {
        return { valid: false, reason: 'invalid_token' };
      }
      return { valid: true };
    }
    
    case 'header': {
      const headerName = authConfig.header_name || 'X-Webhook-Secret';
      const expectedValue = authConfig.header_value || config.secret_key;
      const receivedValue = headers.get(headerName);
      
      if (!receivedValue || receivedValue !== expectedValue) {
        return { valid: false, reason: 'invalid_header' };
      }
      return { valid: true };
    }
    
    case 'hmac': {
      const signatureHeader = authConfig.signature_header || 'X-Signature-256';
      const secret = authConfig.hmac_secret || config.secret_key;
      const algorithm = authConfig.hmac_algorithm || 'sha256';
      const signature = headers.get(signatureHeader);
      
      if (!signature || !secret) {
        return { valid: false, reason: 'missing_signature' };
      }
      
      const isValid = await verifyHmacSignature(bodyRaw, signature, secret, algorithm);
      if (!isValid) {
        return { valid: false, reason: 'invalid_signature' };
      }
      return { valid: true };
    }
    
    case 'ip_whitelist': {
      const ipList: string[] = authConfig.ip_whitelist || [];
      if (!ipList.includes(sourceIp) && !ipList.includes('*')) {
        return { valid: false, reason: 'ip_not_allowed' };
      }
      return { valid: true };
    }
    
    case 'basic': {
      const authHeader = headers.get('Authorization');
      if (!authHeader?.startsWith('Basic ')) {
        return { valid: false, reason: 'missing_basic_auth' };
      }
      
      const credentials = atob(authHeader.slice(6));
      const [username, password] = credentials.split(':');
      
      if (username !== authConfig.username || password !== authConfig.password) {
        return { valid: false, reason: 'invalid_credentials' };
      }
      return { valid: true };
    }
    
    default:
      return { valid: true };
  }
}

// Extract event ID for deduplication
function extractEventId(config: WebhookConfig, body: any, headers: Headers): string | null {
  const field = config.dedup_field || 'event_id';
  
  // Try body first
  if (body && typeof body === 'object') {
    if (body[field]) return String(body[field]);
    if (body.id) return String(body.id);
    if (body.event?.id) return String(body.event.id);
    if (body.data?.id) return String(body.data.id);
  }
  
  // Try headers
  const headerEventId = headers.get('X-Event-ID') || headers.get('X-Request-ID') || headers.get('X-Idempotency-Key');
  if (headerEventId) return headerEventId;
  
  return null;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  
  // Expected path: /genesis-webhook-gateway/{webhook_id}
  // Extract webhook_id from path
  let webhookId = pathParts[pathParts.length - 1];
  
  // Also check query param
  if (!webhookId || webhookId === 'genesis-webhook-gateway') {
    webhookId = url.searchParams.get('webhook_id') || '';
  }
  
  if (!webhookId) {
    return new Response(
      JSON.stringify({ error: 'Missing webhook_id' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log(`[Webhook Gateway] Received request for webhook: ${webhookId}`);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Get webhook config
    const { data: config, error: configError } = await supabase
      .from('genesis_webhook_configs')
      .select('*')
      .eq('webhook_id', webhookId)
      .single();

    if (configError || !config) {
      console.log(`[Webhook Gateway] Webhook not found: ${webhookId}`);
      return new Response(
        JSON.stringify({ error: 'Webhook not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!config.is_active) {
      console.log(`[Webhook Gateway] Webhook inactive: ${webhookId}`);
      return new Response(
        JSON.stringify({ error: 'Webhook is inactive' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get source IP
    const sourceIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || req.headers.get('cf-connecting-ip') 
      || 'unknown';

    // Get raw body
    const bodyRaw = await req.text();
    let bodyParsed: any = null;
    
    try {
      bodyParsed = JSON.parse(bodyRaw);
    } catch {
      // Try form data parsing
      try {
        const params = new URLSearchParams(bodyRaw);
        bodyParsed = Object.fromEntries(params);
      } catch {
        bodyParsed = { raw: bodyRaw };
      }
    }

    // Check rate limits
    const { data: rateLimitResult } = await supabase.rpc('genesis_check_webhook_rate_limit', {
      p_webhook_config_id: config.id,
      p_source_ip: sourceIp
    });

    if (rateLimitResult && !rateLimitResult.allowed) {
      console.log(`[Webhook Gateway] Rate limited: ${webhookId} from ${sourceIp}`);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded', reason: rateLimitResult.reason }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate authentication
    const authResult = await validateAuth(config as WebhookConfig, req.headers, sourceIp, bodyRaw);
    if (!authResult.valid) {
      console.log(`[Webhook Gateway] Auth failed: ${webhookId} - ${authResult.reason}`);
      
      // Log rejected event
      await supabase.from('genesis_webhook_events').insert({
        webhook_config_id: config.id,
        method: req.method,
        path: url.pathname,
        headers: Object.fromEntries(req.headers.entries()),
        query_params: Object.fromEntries(url.searchParams.entries()),
        body_raw: bodyRaw,
        body_parsed: bodyParsed,
        source_ip: sourceIp,
        user_agent: req.headers.get('user-agent'),
        status: 'rejected',
        validation_result: { auth_failed: authResult.reason }
      });
      
      return new Response(
        JSON.stringify({ error: 'Authentication failed', reason: authResult.reason }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check deduplication
    const eventId = extractEventId(config as WebhookConfig, bodyParsed, req.headers);
    
    if (eventId && config.dedup_enabled) {
      const { data: isDuplicate } = await supabase.rpc('genesis_check_webhook_dedup', {
        p_webhook_config_id: config.id,
        p_event_id: eventId
      });
      
      if (isDuplicate === false) {
        console.log(`[Webhook Gateway] Duplicate event: ${webhookId} - ${eventId}`);
        
        await supabase.from('genesis_webhook_events').insert({
          webhook_config_id: config.id,
          event_id: eventId,
          method: req.method,
          path: url.pathname,
          headers: Object.fromEntries(req.headers.entries()),
          query_params: Object.fromEntries(url.searchParams.entries()),
          body_raw: bodyRaw,
          body_parsed: bodyParsed,
          source_ip: sourceIp,
          user_agent: req.headers.get('user-agent'),
          status: 'duplicate'
        });
        
        return new Response(
          JSON.stringify({ success: true, message: 'Duplicate event ignored' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Generate execution ID
    const executionId = crypto.randomUUID();

    // Store webhook event
    const { data: webhookEvent, error: eventError } = await supabase
      .from('genesis_webhook_events')
      .insert({
        webhook_config_id: config.id,
        event_id: eventId,
        execution_id: executionId,
        method: req.method,
        path: url.pathname,
        headers: Object.fromEntries(req.headers.entries()),
        query_params: Object.fromEntries(url.searchParams.entries()),
        body_raw: bodyRaw,
        body_parsed: bodyParsed,
        content_type: req.headers.get('content-type'),
        source_ip: sourceIp,
        user_agent: req.headers.get('user-agent'),
        status: 'validated'
      })
      .select()
      .single();

    if (eventError) {
      console.error(`[Webhook Gateway] Failed to store event:`, eventError);
    }

    // Check if flow is active
    if (config.flow_id) {
      const { data: flow } = await supabase
        .from('whatsapp_automation_rules')
        .select('id, lifecycle_status, is_active, flow_data')
        .eq('id', config.flow_id)
        .single();

      if (flow && (flow.lifecycle_status === 'active' || flow.is_active)) {
        // Update event status to queued
        await supabase
          .from('genesis_webhook_events')
          .update({ status: 'queued', processed_at: new Date().toISOString() })
          .eq('id', webhookEvent?.id);

        // Create execution record
        await supabase.from('flow_execution_history').insert({
          flow_id: config.flow_id,
          execution_id: executionId,
          trigger_type: 'webhook',
          trigger_data: {
            webhook_id: webhookId,
            event_id: eventId,
            source_ip: sourceIp,
            method: req.method,
            headers: Object.fromEntries(req.headers.entries()),
            query_params: Object.fromEntries(url.searchParams.entries()),
            body: bodyParsed
          },
          status: 'queued'
        });

        // Dispatch to automation worker
        try {
          await supabase.functions.invoke('whatsapp-automation-worker', {
            body: {
              source: 'webhook_gateway',
              execution_id: executionId,
              flow_id: config.flow_id,
              event_type: 'webhook_received',
              event_data: {
                webhook_id: webhookId,
                webhook_config_id: config.id,
                event_id: eventId,
                payload: bodyParsed,
                headers: Object.fromEntries(req.headers.entries()),
                query: Object.fromEntries(url.searchParams.entries()),
                metadata: {
                  source_ip: sourceIp,
                  method: req.method,
                  content_type: req.headers.get('content-type'),
                  received_at: new Date().toISOString()
                }
              }
            }
          });
          
          console.log(`[Webhook Gateway] Dispatched to worker: ${executionId}`);
        } catch (workerError) {
          console.error(`[Webhook Gateway] Worker dispatch failed:`, workerError);
          
          // Create dead letter
          await supabase.from('genesis_webhook_dead_letters').insert({
            webhook_event_id: webhookEvent?.id,
            webhook_config_id: config.id,
            original_payload: bodyParsed,
            original_headers: Object.fromEntries(req.headers.entries()),
            failure_reason: 'worker_dispatch_failed',
            failure_details: { error: String(workerError) }
          });
        }
      } else {
        console.log(`[Webhook Gateway] Flow not active: ${config.flow_id}`);
        
        await supabase
          .from('genesis_webhook_events')
          .update({ status: 'rejected', error_message: 'Flow not active' })
          .eq('id', webhookEvent?.id);
      }
    }

    // Update last triggered
    await supabase
      .from('genesis_webhook_configs')
      .update({ last_triggered_at: new Date().toISOString() })
      .eq('id', config.id);

    // Return custom response if configured
    if (config.custom_response_enabled && config.custom_response) {
      return new Response(
        JSON.stringify(config.custom_response.body),
        { 
          status: config.custom_response.status || 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Default success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        execution_id: executionId,
        event_id: eventId,
        message: 'Webhook received and queued for processing'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error(`[Webhook Gateway] Error:`, error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
