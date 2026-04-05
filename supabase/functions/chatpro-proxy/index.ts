import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Não autorizado' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      return jsonResponse({ error: 'Token inválido' }, 401);
    }

    const body = await req.json();
    const { action, connector_id, ...params } = body;

    console.log(`[ChatPro Proxy] action=${action} user=${user.id}`);

    // Get connector config
    const { data: connector, error: connError } = await supabase
      .from('engine_whatsapp_connectors')
      .select('*')
      .eq('id', connector_id)
      .eq('user_id', user.id)
      .single();

    if (connError || !connector) {
      return jsonResponse({ error: 'Conector não encontrado' }, 404);
    }

    if (!connector.instance_id || !connector.token_hash) {
      return jsonResponse({ error: 'Conector não configurado. Preencha instance_id e token.' }, 400);
    }

    // Build API base URL - handle cases where base_endpoint might already contain instance_id
    let baseUrl = (connector.base_endpoint || 'https://v5.chatpro.com.br').replace(/\/$/, '');
    const instanceId = connector.instance_id;
    
    // If base_endpoint already contains the instance_id, strip it to avoid duplication
    if (baseUrl.endsWith(`/${instanceId}`)) {
      baseUrl = baseUrl.slice(0, baseUrl.length - instanceId.length - 1);
    }
    
    const apiBase = `${baseUrl}/${instanceId}/api/v1`;
    console.log(`[ChatPro Proxy] apiBase=${apiBase}`);

    switch (action) {
      case 'test_connection': {
        const resp = await chatproFetch(`${apiBase}/status`, 'GET', connector.token_hash);
        const data = await safeJson(resp);

        console.log(`[ChatPro Proxy] test_connection status=${resp.status} data=${JSON.stringify(data)}`);

        const isConnected = resp.ok && data?.connected === true;
        
        await supabase.from('engine_whatsapp_connectors').update({
          status: isConnected ? 'connected' : 'disconnected',
          last_connected_at: isConnected ? new Date().toISOString() : connector.last_connected_at,
          last_error: isConnected ? null : (data?.message || data?.error || `HTTP ${resp.status}`),
        }).eq('id', connector_id);

        return jsonResponse({ 
          connected: isConnected, 
          status: resp.status,
          details: data 
        });
      }

      case 'get_qrcode': {
        // Try multiple QR code endpoint patterns used by ChatPro
        let resp: Response;
        let data: any;
        let qrValue: string | null = null;

        // Attempt 1: POST /generate_qrcode
        resp = await chatproFetch(`${apiBase}/generate_qrcode`, 'POST', connector.token_hash);
        data = await safeJson(resp);
        console.log(`[ChatPro Proxy] qr attempt1 POST /generate_qrcode status=${resp.status} data=${JSON.stringify(data)}`);
        
        if (resp.ok && data) {
          qrValue = data?.base64 || data?.qrcode || data?.value || data?.data?.qrcode || data?.data?.base64;
        }

        // Attempt 2: GET /generate_qrcode (some versions use GET)
        if (!qrValue) {
          resp = await chatproFetch(`${apiBase}/generate_qrcode`, 'GET', connector.token_hash);
          data = await safeJson(resp);
          console.log(`[ChatPro Proxy] qr attempt2 GET /generate_qrcode status=${resp.status} data=${JSON.stringify(data)}`);
          if (resp.ok && data) {
            qrValue = data?.base64 || data?.qrcode || data?.value || data?.data?.qrcode || data?.data?.base64;
          }
        }

        // Attempt 3: POST /qrcode
        if (!qrValue) {
          resp = await chatproFetch(`${apiBase}/qrcode`, 'POST', connector.token_hash);
          data = await safeJson(resp);
          console.log(`[ChatPro Proxy] qr attempt3 POST /qrcode status=${resp.status} data=${JSON.stringify(data)}`);
          if (resp.ok && data) {
            qrValue = data?.base64 || data?.qrcode || data?.value || data?.data?.qrcode || data?.data?.base64;
          }
        }

        if (qrValue) {
          await supabase.from('engine_whatsapp_connectors').update({
            status: 'awaiting_qr',
          }).eq('id', connector_id);

          return jsonResponse({ qrcode: qrValue, raw: data });
        }

        // Return detailed error for debugging
        return jsonResponse({ 
          error: 'Não foi possível gerar o QR Code. Verifique se a instância existe e está desconectada no painel ChatPro.',
          details: data,
          http_status: resp.status,
          api_url: apiBase,
        }, 400);
      }

      case 'disconnect': {
        const resp = await chatproFetch(`${apiBase}/disconnect`, 'POST', connector.token_hash);
        const data = await safeJson(resp);

        await supabase.from('engine_whatsapp_connectors').update({
          status: 'disconnected',
        }).eq('id', connector_id);

        return jsonResponse({ success: true, details: data });
      }

      case 'send_message': {
        const { phone, message } = params;
        if (!phone || !message) {
          return jsonResponse({ error: 'phone e message são obrigatórios' }, 400);
        }

        // Format phone
        let formattedPhone = phone.replace(/\D/g, '');
        if (!formattedPhone.startsWith('55') && formattedPhone.length <= 11) {
          formattedPhone = '55' + formattedPhone;
        }

        const resp = await chatproFetch(`${apiBase}/send_message`, 'POST', connector.token_hash, {
          number: formattedPhone,
          message: message,
        });
        const data = await safeJson(resp);

        // Log the message
        await supabase.from('engine_message_logs').insert({
          user_id: user.id,
          connector_id: connector_id,
          session_id: params.session_id || null,
          phone: formattedPhone,
          message_preview: message.substring(0, 100),
          full_message: message,
          status: resp.ok ? 'sent' : 'failed',
          provider_response: data,
          error_message: resp.ok ? null : (data?.message || `Status ${resp.status}`),
          sent_at: resp.ok ? new Date().toISOString() : null,
          metadata: { lead_name: params.lead_name },
        });

        if (!resp.ok) {
          return jsonResponse({ error: 'Falha ao enviar', details: data }, 500);
        }

        return jsonResponse({ success: true, message_id: data?.id, details: data });
      }

      case 'get_status': {
        const resp = await chatproFetch(`${apiBase}/status`, 'GET', connector.token_hash);
        const data = await safeJson(resp);
        return jsonResponse({ status: resp.status, details: data });
      }

      default:
        return jsonResponse({ error: `Ação desconhecida: ${action}` }, 400);
    }
  } catch (error) {
    console.error('[ChatPro Proxy] Error:', error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      500
    );
  }
});

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function chatproFetch(url: string, method: string, token: string, body?: any) {
  const opts: RequestInit = {
    method,
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
      'accept': 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  
  try {
    return await fetch(url, opts);
  } catch (err) {
    console.error(`[ChatPro Proxy] fetch error for ${url}:`, err);
    // Return a synthetic error response
    return new Response(JSON.stringify({ error: `Falha na conexão com ${url}` }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function safeJson(resp: Response) {
  try {
    const text = await resp.text();
    return JSON.parse(text);
  } catch {
    return null;
  }
}
