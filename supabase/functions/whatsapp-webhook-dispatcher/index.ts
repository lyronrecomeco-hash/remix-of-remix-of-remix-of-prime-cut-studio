import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookConfig {
  id: string;
  project_id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  secret_key: string;
  retry_count: number;
  retry_delay_seconds: number;
}

interface WebhookLog {
  webhook_id: string;
  event_type: string;
  payload: any;
  status_code: number | null;
  response_body: string | null;
  error_message: string | null;
  attempt_number: number;
  sent_at: string;
}

// Generate HMAC signature
async function generateSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Send webhook with retry
async function sendWebhook(
  supabase: any,
  webhook: WebhookConfig,
  eventType: string,
  data: any,
  attempt: number = 1
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  const payload = {
    event: eventType,
    timestamp: new Date().toISOString(),
    data,
    webhookId: webhook.id,
  };

  const payloadString = JSON.stringify(payload);
  const signature = await generateSignature(payloadString, webhook.secret_key);

  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': `sha256=${signature}`,
        'X-Webhook-Event': eventType,
        'X-Webhook-Delivery': crypto.randomUUID(),
        'User-Agent': 'Genesis-WhatsApp-Webhook/1.0',
      },
      body: payloadString,
    });

    const responseBody = await response.text();

    // Log the attempt
    await supabase.from('whatsapp_webhook_logs').insert({
      webhook_id: webhook.id,
      event_type: eventType,
      payload,
      status_code: response.status,
      response_body: responseBody.substring(0, 5000), // Limit response size
      attempt_number: attempt,
      sent_at: new Date().toISOString(),
    });

    if (response.ok) {
      return { success: true, statusCode: response.status };
    }

    // Retry if failed and within retry limit
    if (attempt < webhook.retry_count) {
      const delay = webhook.retry_delay_seconds * Math.pow(2, attempt - 1) * 1000;
      console.log(`Webhook failed, retrying in ${delay}ms (attempt ${attempt + 1}/${webhook.retry_count})`);
      
      await new Promise(resolve => setTimeout(resolve, Math.min(delay, 30000)));
      return sendWebhook(supabase, webhook, eventType, data, attempt + 1);
    }

    return { success: false, statusCode: response.status, error: `HTTP ${response.status}` };
  } catch (error: any) {
    // Log the error
    await supabase.from('whatsapp_webhook_logs').insert({
      webhook_id: webhook.id,
      event_type: eventType,
      payload,
      error_message: error?.message || 'Unknown error',
      attempt_number: attempt,
      sent_at: new Date().toISOString(),
    });

    // Retry if within limit
    if (attempt < webhook.retry_count) {
      const delay = webhook.retry_delay_seconds * Math.pow(2, attempt - 1) * 1000;
      console.log(`Webhook error, retrying in ${delay}ms (attempt ${attempt + 1}/${webhook.retry_count})`);
      
      await new Promise(resolve => setTimeout(resolve, Math.min(delay, 30000)));
      return sendWebhook(supabase, webhook, eventType, data, attempt + 1);
    }

    return { success: false, error: error?.message || 'Unknown error' };
  }
}

// Dispatch event to all matching webhooks
async function dispatchEvent(
  supabase: any,
  projectId: string,
  eventType: string,
  data: any
): Promise<{ total: number; success: number; failed: number; results: any[] }> {
  // Get active webhooks for this project and event
  const { data: webhooks } = await supabase
    .from('whatsapp_external_webhooks')
    .select('*')
    .eq('project_id', projectId)
    .eq('is_active', true)
    .contains('events', [eventType]);

  if (!webhooks || webhooks.length === 0) {
    console.log(`No webhooks configured for event: ${eventType}`);
    return { total: 0, success: 0, failed: 0, results: [] };
  }

  console.log(`Dispatching ${eventType} to ${webhooks.length} webhooks`);

  const results = [];
  let success = 0;
  let failed = 0;

  for (const webhook of webhooks as WebhookConfig[]) {
    const result = await sendWebhook(supabase, webhook, eventType, data);
    
    results.push({
      webhookId: webhook.id,
      webhookName: webhook.name,
      ...result,
    });

    if (result.success) {
      success++;
    } else {
      failed++;
    }
  }

  return { total: webhooks.length, success, failed, results };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const body = await req.json();
    const { projectId, eventType, data } = body;

    if (!projectId || !eventType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: projectId, eventType' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate project exists
    const { data: project } = await supabase
      .from('whatsapp_api_projects')
      .select('id, name')
      .eq('id', projectId)
      .single();

    if (!project) {
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Dispatch event to webhooks
    const result = await dispatchEvent(supabase, projectId, eventType, data || {});

    return new Response(
      JSON.stringify({ 
        eventType,
        ...result 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Dispatcher error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
