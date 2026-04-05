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
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Token inválido' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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

    const baseUrl = (connector.base_endpoint || 'https://v5.chatpro.com.br').replace(/\/$/, '');
    const apiBase = `${baseUrl}/${connector.instance_id}/api/v1`;

    switch (action) {
      case 'test_connection': {
        const resp = await chatproFetch(`${apiBase}/status`, 'GET', connector.token_hash);
        const data = await safeJson(resp);

        const isConnected = resp.ok && data?.connected === true;
        
        await supabase.from('engine_whatsapp_connectors').update({
          status: isConnected ? 'connected' : 'disconnected',
          last_connected_at: isConnected ? new Date().toISOString() : connector.last_connected_at,
          last_error: isConnected ? null : (data?.message || `Status: ${resp.status}`),
        }).eq('id', connector_id);

        return jsonResponse({ 
          connected: isConnected, 
          status: resp.status,
          details: data 
        });
      }

      case 'get_qrcode': {
        const resp = await chatproFetch(`${apiBase}/generate_qrcode`, 'POST', connector.token_hash);
        const data = await safeJson(resp);

        if (!resp.ok) {
          return jsonResponse({ error: 'Erro ao gerar QR Code', details: data }, 500);
        }

        await supabase.from('engine_whatsapp_connectors').update({
          status: 'awaiting_qr',
        }).eq('id', connector_id);

        return jsonResponse({ 
          qrcode: data?.base64 || data?.qrcode || data?.value,
          raw: data 
        });
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
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
  return fetch(url, opts);
}

async function safeJson(resp: Response) {
  try {
    const text = await resp.text();
    return JSON.parse(text);
  } catch {
    return null;
  }
}
