import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key, x-api-secret',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface APIProject {
  id: string;
  name: string;
  api_key: string;
  api_secret: string;
  is_active: boolean;
  rate_limit_per_minute: number;
  rate_limit_per_day: number;
}

interface RateLimitCheck {
  allowed: boolean;
  remaining: number;
  resetAt: string;
}

// Authentication middleware
async function authenticateRequest(
  supabase: any,
  apiKey: string | null,
  apiSecret: string | null
): Promise<{ success: boolean; project?: APIProject; error?: string }> {
  if (!apiKey || !apiSecret) {
    return { success: false, error: 'Missing API credentials. Provide X-API-Key and X-API-Secret headers.' };
  }

  const { data: project, error } = await supabase
    .from('whatsapp_api_projects')
    .select('*')
    .eq('api_key', apiKey)
    .eq('api_secret', apiSecret)
    .single();

  if (error || !project) {
    return { success: false, error: 'Invalid API credentials.' };
  }

  if (!project.is_active) {
    return { success: false, error: 'API project is inactive.' };
  }

  return { success: true, project };
}

// Rate limiting check
async function checkRateLimit(
  supabase: any,
  projectId: string,
  rateLimitPerMinute: number,
  rateLimitPerDay: number
): Promise<RateLimitCheck> {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60000);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Check minute limit
  const { count: minuteCount } = await supabase
    .from('whatsapp_api_logs')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .gte('created_at', oneMinuteAgo.toISOString());

  if ((minuteCount || 0) >= rateLimitPerMinute) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(now.getTime() + 60000).toISOString(),
    };
  }

  // Check daily limit
  const { count: dayCount } = await supabase
    .from('whatsapp_api_logs')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .gte('created_at', startOfDay.toISOString());

  if ((dayCount || 0) >= rateLimitPerDay) {
    const tomorrow = new Date(startOfDay.getTime() + 86400000);
    return {
      allowed: false,
      remaining: 0,
      resetAt: tomorrow.toISOString(),
    };
  }

  return {
    allowed: true,
    remaining: Math.min(rateLimitPerMinute - (minuteCount || 0), rateLimitPerDay - (dayCount || 0)),
    resetAt: new Date(now.getTime() + 60000).toISOString(),
  };
}

// Log API request
async function logRequest(
  supabase: any,
  projectId: string,
  method: string,
  endpoint: string,
  statusCode: number,
  responseTime: number,
  requestBody?: any,
  responseBody?: any,
  errorMessage?: string
) {
  await supabase.from('whatsapp_api_logs').insert({
    project_id: projectId,
    method,
    endpoint,
    status_code: statusCode,
    response_time_ms: responseTime,
    request_body: requestBody,
    response_body: responseBody,
    error_message: errorMessage,
  });
}

// Get linked instances for project
async function getProjectInstances(supabase: any, projectId: string) {
  const { data: links } = await supabase
    .from('whatsapp_project_instances')
    .select('instance_id')
    .eq('project_id', projectId)
    .eq('is_active', true);

  if (!links || links.length === 0) return [];

  const instanceIds = links.map((l: any) => l.instance_id);
  const { data: instances } = await supabase
    .from('whatsapp_instances')
    .select('id, name, phone_number, status, effective_status')
    .in('id', instanceIds);

  return instances || [];
}

// Send message via backend
async function sendMessage(
  supabase: any,
  instanceId: string,
  to: string,
  message: string,
  messageType: string = 'text'
) {
  // Get instance and backend config
  const { data: instance } = await supabase
    .from('whatsapp_instances')
    .select('*, whatsapp_backend_config(*)')
    .eq('id', instanceId)
    .single();

  if (!instance) {
    return { success: false, error: 'Instance not found' };
  }

  if (instance.effective_status !== 'connected') {
    return { success: false, error: 'Instance not connected' };
  }

  const backend = instance.whatsapp_backend_config?.[0];
  if (!backend || !backend.is_connected) {
    return { success: false, error: 'Backend not configured or not connected' };
  }

  // Build backend URL
  const backendUrl = `${backend.backend_url}/send`;
  
  try {
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${backend.backend_token}`,
        'X-Instance-Token': instance.instance_token,
      },
      body: JSON.stringify({
        to: to.replace(/\D/g, ''),
        message,
        type: messageType,
      }),
    });

    const result = await response.json();

    // Log message
    await supabase.from('whatsapp_message_logs').insert({
      instance_id: instanceId,
      recipient: to,
      message_type: messageType,
      content: message,
      status: response.ok ? 'sent' : 'failed',
      external_id: result.messageId || null,
      error_message: result.error || null,
    });

    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to send message' };
    }

    return { success: true, messageId: result.messageId, status: 'sent' };
  } catch (error: any) {
    return { success: false, error: `Backend error: ${error?.message || 'Unknown error'}` };
  }
}

// Queue event for automation processing
async function queueEvent(
  supabase: any,
  projectId: string,
  eventType: string,
  eventData: any
) {
  const { data, error } = await supabase
    .from('whatsapp_event_queue')
    .insert({
      project_id: projectId,
      event_type: eventType,
      event_data: eventData,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, eventId: data.id };
}

// Main handler
Deno.serve(async (req) => {
  const startTime = Date.now();
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  
  // Remove 'whatsapp-core' from path if present
  const basePath = pathParts[0] === 'whatsapp-core' ? pathParts.slice(1) : pathParts;
  const action = basePath[0] || '';
  const subAction = basePath[1] || '';

  // Health check (no auth required)
  if (action === 'health') {
    return new Response(
      JSON.stringify({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Authenticate request
  const apiKey = req.headers.get('x-api-key');
  const apiSecret = req.headers.get('x-api-secret');
  
  const authResult = await authenticateRequest(supabase, apiKey, apiSecret);
  
  if (!authResult.success) {
    return new Response(
      JSON.stringify({ error: authResult.error }),
      { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  const project = authResult.project!;

  // Check rate limit
  const rateLimitResult = await checkRateLimit(
    supabase,
    project.id,
    project.rate_limit_per_minute,
    project.rate_limit_per_day
  );

  if (!rateLimitResult.allowed) {
    const responseTime = Date.now() - startTime;
    await logRequest(supabase, project.id, req.method, action, 429, responseTime, null, null, 'Rate limit exceeded');
    
    return new Response(
      JSON.stringify({ 
        error: 'Rate limit exceeded',
        resetAt: rateLimitResult.resetAt 
      }),
      { 
        status: 429, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetAt,
        } 
      }
    );
  }

  let responseData: any;
  let statusCode = 200;
  let errorMessage: string | undefined;

  try {
    // Route handlers
    switch (action) {
      case 'send': {
        if (req.method !== 'POST') {
          statusCode = 405;
          responseData = { error: 'Method not allowed' };
          break;
        }

        const body = await req.json();
        const { instanceId, to, message, type = 'text' } = body;

        if (!instanceId || !to || !message) {
          statusCode = 400;
          responseData = { error: 'Missing required fields: instanceId, to, message' };
          break;
        }

        // Verify instance belongs to project
        const instances = await getProjectInstances(supabase, project.id);
        const instance = instances.find((i: any) => i.id === instanceId);

        if (!instance) {
          statusCode = 403;
          responseData = { error: 'Instance not linked to this project' };
          break;
        }

        const result = await sendMessage(supabase, instanceId, to, message, type);
        
        if (!result.success) {
          statusCode = 500;
          responseData = { error: result.error };
          errorMessage = result.error;
        } else {
          responseData = { 
            success: true, 
            messageId: result.messageId,
            status: result.status 
          };
        }
        break;
      }

      case 'send-bulk': {
        if (req.method !== 'POST') {
          statusCode = 405;
          responseData = { error: 'Method not allowed' };
          break;
        }

        const body = await req.json();
        const { instanceId, messages } = body;

        if (!instanceId || !messages || !Array.isArray(messages)) {
          statusCode = 400;
          responseData = { error: 'Missing required fields: instanceId, messages (array)' };
          break;
        }

        // Verify instance belongs to project
        const instances = await getProjectInstances(supabase, project.id);
        const instance = instances.find((i: any) => i.id === instanceId);

        if (!instance) {
          statusCode = 403;
          responseData = { error: 'Instance not linked to this project' };
          break;
        }

        const results = [];
        for (const msg of messages.slice(0, 100)) { // Max 100 messages per batch
          const result = await sendMessage(supabase, instanceId, msg.to, msg.message, msg.type || 'text');
          results.push({
            to: msg.to,
            success: result.success,
            messageId: result.messageId,
            error: result.error,
          });
        }

        responseData = {
          success: true,
          total: results.length,
          sent: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          results,
        };
        break;
      }

      case 'status': {
        if (req.method !== 'GET') {
          statusCode = 405;
          responseData = { error: 'Method not allowed' };
          break;
        }

        const messageId = subAction;
        if (!messageId) {
          statusCode = 400;
          responseData = { error: 'Missing messageId in path' };
          break;
        }

        const { data: messageLog } = await supabase
          .from('whatsapp_message_logs')
          .select('*')
          .eq('external_id', messageId)
          .single();

        if (!messageLog) {
          statusCode = 404;
          responseData = { error: 'Message not found' };
        } else {
          responseData = {
            messageId: messageLog.external_id,
            status: messageLog.status,
            recipient: messageLog.recipient,
            sentAt: messageLog.created_at,
            deliveredAt: messageLog.delivered_at,
            readAt: messageLog.read_at,
          };
        }
        break;
      }

      case 'events': {
        if (req.method !== 'POST') {
          statusCode = 405;
          responseData = { error: 'Method not allowed' };
          break;
        }

        const body = await req.json();
        const { eventType, data } = body;

        if (!eventType) {
          statusCode = 400;
          responseData = { error: 'Missing required field: eventType' };
          break;
        }

        const result = await queueEvent(supabase, project.id, eventType, data || {});
        
        if (!result.success) {
          statusCode = 500;
          responseData = { error: result.error };
          errorMessage = result.error;
        } else {
          responseData = { 
            success: true, 
            eventId: result.eventId,
            message: 'Event queued for processing' 
          };
        }
        break;
      }

      case 'instances': {
        if (req.method !== 'GET') {
          statusCode = 405;
          responseData = { error: 'Method not allowed' };
          break;
        }

        const instances = await getProjectInstances(supabase, project.id);
        responseData = {
          success: true,
          count: instances.length,
          instances: instances.map((i: any) => ({
            id: i.id,
            name: i.name,
            phoneNumber: i.phone_number,
            status: i.effective_status || i.status,
          })),
        };
        break;
      }

      default:
        statusCode = 404;
        responseData = { 
          error: 'Endpoint not found',
          availableEndpoints: [
            'POST /send',
            'POST /send-bulk',
            'GET /status/:messageId',
            'POST /events',
            'GET /instances',
            'GET /health',
          ]
        };
    }
  } catch (error: any) {
    console.error('API Error:', error);
    statusCode = 500;
    responseData = { error: 'Internal server error' };
    errorMessage = error?.message || 'Unknown error';
  }

  const responseTime = Date.now() - startTime;

  // Log request
  let requestBody = null;
  try {
    if (req.method === 'POST') {
      requestBody = await req.clone().json();
    }
  } catch {}

  await logRequest(
    supabase,
    project.id,
    req.method,
    action || 'root',
    statusCode,
    responseTime,
    requestBody,
    responseData,
    errorMessage
  );

  return new Response(
    JSON.stringify(responseData),
    { 
      status: statusCode, 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
        'X-Response-Time': `${responseTime}ms`,
      } 
    }
  );
});
