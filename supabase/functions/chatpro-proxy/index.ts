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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return jsonResponse({ error: 'Não autorizado' }, 401);

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) return jsonResponse({ error: 'Token inválido' }, 401);

    const body = await req.json();
    const { action, connector_id, ...params } = body;

    console.log(`[ChatPro] action=${action} user=${user.id}`);

    const { data: connector, error: connError } = await supabase
      .from('engine_whatsapp_connectors')
      .select('*')
      .eq('id', connector_id)
      .eq('user_id', user.id)
      .single();

    if (connError || !connector) return jsonResponse({ error: 'Conector não encontrado' }, 404);
    if (!connector.instance_id || !connector.token_hash) {
      return jsonResponse({ error: 'Conector não configurado. Preencha instance_id e token.' }, 400);
    }

    let baseUrl = (connector.base_endpoint || 'https://v5.chatpro.com.br').replace(/\/$/, '');
    const instanceId = connector.instance_id;
    if (baseUrl.endsWith(`/${instanceId}`)) {
      baseUrl = baseUrl.slice(0, baseUrl.length - instanceId.length - 1);
    }
    const apiBase = `${baseUrl}/${instanceId}/api/v1`;
    console.log(`[ChatPro] apiBase=${apiBase}`);

    const updateConnector = async (updates: Record<string, any>) => {
      await supabase.from('engine_whatsapp_connectors').update(updates).eq('id', connector_id);
    };

    switch (action) {
      // ─── TEST CONNECTION ───
      case 'test_connection': {
        const resp = await chatproFetch(`${apiBase}/status`, 'GET', connector.token_hash);
        const data = await safeJson(resp);
        console.log(`[ChatPro] test status=${resp.status} data=${JSON.stringify(data)}`);

        const connected = resp.ok && isConnectedPayload(data);
        await updateConnector({
          status: connected ? 'connected' : 'disconnected',
          last_connected_at: connected ? new Date().toISOString() : connector.last_connected_at,
          last_error: connected ? null : (data?.message || data?.error || `HTTP ${resp.status}`),
        });

        return jsonResponse({ connected, status: resp.status, details: data });
      }

      // ─── DISCONNECT (full session invalidation) ───
      case 'disconnect': {
        console.log(`[ChatPro] Starting full disconnect sequence`);

        // Step 1: Try logout first (clears WhatsApp session)
        const logoutAttempts = [
          { url: `${apiBase}/logout`, method: 'POST' },
          { url: `${apiBase}/disconnect`, method: 'POST' },
          { url: `${apiBase}/disconnect`, method: 'GET' },
        ] as const;

        let disconnectOk = false;
        for (const attempt of logoutAttempts) {
          const resp = await chatproFetch(attempt.url, attempt.method, connector.token_hash);
          const data = await safeJson(resp);
          console.log(`[ChatPro] disconnect ${attempt.method} ${attempt.url} → ${resp.status} ${JSON.stringify(data)}`);
          if (resp.ok) { disconnectOk = true; break; }
        }

        // Step 2: Try restart to fully reset instance state
        const restartResp = await chatproFetch(`${apiBase}/restart`, 'POST', connector.token_hash);
        const restartData = await safeJson(restartResp);
        console.log(`[ChatPro] restart → ${restartResp.status} ${JSON.stringify(restartData)}`);

        // Step 3: Wait briefly then verify
        await new Promise(r => setTimeout(r, 2000));

        const statusResp = await chatproFetch(`${apiBase}/status`, 'GET', connector.token_hash);
        const statusData = await safeJson(statusResp);
        const stillConnected = statusResp.ok && isConnectedPayload(statusData);
        console.log(`[ChatPro] post-disconnect check: stillConnected=${stillConnected}`);

        if (stillConnected && !disconnectOk) {
          return jsonResponse({ error: 'Não foi possível desconectar. Tente desconectar manualmente no painel ChatPro.', details: statusData }, 400);
        }

        // Step 4: Update local state to disconnected
        await updateConnector({
          status: 'disconnected',
          last_error: null,
        });

        return jsonResponse({ success: true, verified: !stillConnected });
      }

      // ─── GET QR CODE ───
      case 'get_qrcode': {
        // Step 1: Check current status - if connected, return immediately
        const statusResp = await chatproFetch(`${apiBase}/status`, 'GET', connector.token_hash);
        const statusData = await safeJson(statusResp);
        console.log(`[ChatPro] qr pre-check: ${resp_status(statusResp)} ${JSON.stringify(statusData)}`);

        if (statusResp.ok && isConnectedPayload(statusData)) {
          await updateConnector({
            status: 'connected',
            last_connected_at: new Date().toISOString(),
            last_error: null,
          });
          return jsonResponse({ connected: true, status: 'connected', details: statusData });
        }

        // Step 2: Generate QR code
        const qrAttempts = [
          { url: `${apiBase}/generate_qrcode`, method: 'POST' },
          { url: `${apiBase}/generate_qrcode`, method: 'GET' },
          { url: `${apiBase}/qrcode`, method: 'POST' },
          { url: `${apiBase}/qrcode`, method: 'GET' },
        ] as const;

        let qrValue: string | null = null;
        let lastData: any = null;
        let lastResp: Response | null = null;

        for (const attempt of qrAttempts) {
          const resp = await chatproFetch(attempt.url, attempt.method, connector.token_hash);
          const data = await safeJson(resp);
          lastData = data;
          lastResp = resp;
          console.log(`[ChatPro] qr ${attempt.method} ${attempt.url} → ${resp.status}`);

          // Check if it connected while generating QR
          if (resp.ok && isConnectedPayload(data)) {
            await updateConnector({
              status: 'connected',
              last_connected_at: new Date().toISOString(),
              last_error: null,
            });
            return jsonResponse({ connected: true, status: 'connected', details: data });
          }

          if (resp.ok && data) {
            qrValue = extractQrValue(data);
            if (qrValue) break;
          }
        }

        if (qrValue) {
          await updateConnector({ status: 'awaiting_qr', last_error: null });
          return jsonResponse({ qrcode: qrValue });
        }

        return jsonResponse({
          error: 'Não foi possível gerar o QR Code. Verifique se a instância existe e está desconectada no painel ChatPro.',
          details: lastData,
          http_status: lastResp?.status || 0,
        }, 400);
      }

      // ─── CHECK STATUS (lightweight polling) ───
      case 'get_status': {
        const resp = await chatproFetch(`${apiBase}/status`, 'GET', connector.token_hash);
        const data = await safeJson(resp);
        const connected = resp.ok && isConnectedPayload(data);

        // Sync DB status if changed
        if (connected && connector.status !== 'connected') {
          await updateConnector({
            status: 'connected',
            last_connected_at: new Date().toISOString(),
            last_error: null,
          });
        } else if (!connected && connector.status === 'connected') {
          await updateConnector({ status: 'disconnected' });
        }

        return jsonResponse({ connected, status: connected ? 'connected' : 'disconnected', details: data });
      }

      // ─── SEND MESSAGE ───
      case 'send_message': {
        const { phone, message } = params;
        if (!phone || !message) return jsonResponse({ error: 'phone e message são obrigatórios' }, 400);

        let formattedPhone = phone.replace(/\D/g, '');
        if (!formattedPhone.startsWith('55') && formattedPhone.length <= 11) {
          formattedPhone = '55' + formattedPhone;
        }

        const resp = await chatproFetch(`${apiBase}/send_message`, 'POST', connector.token_hash, {
          number: formattedPhone,
          message,
        });
        const data = await safeJson(resp);

        await supabase.from('engine_message_logs').insert({
          user_id: user.id,
          connector_id,
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

        if (!resp.ok) return jsonResponse({ error: 'Falha ao enviar', details: data }, 500);
        return jsonResponse({ success: true, message_id: data?.id, details: data });
      }

      default:
        return jsonResponse({ error: `Ação desconhecida: ${action}` }, 400);
    }
  } catch (error) {
    console.error('[ChatPro] Error:', error);
    return jsonResponse({ error: error instanceof Error ? error.message : 'Erro interno' }, 500);
  }
});

function resp_status(r: Response) { return r.status; }

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
    console.error(`[ChatPro] fetch error ${url}:`, err);
    return new Response(JSON.stringify({ error: `Conexão falhou: ${url}` }), {
      status: 502, headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function safeJson(resp: Response) {
  try { return JSON.parse(await resp.text()); } catch { return null; }
}

function extractQrValue(data: any) {
  const candidates = [
    data?.qr, data?.base64, data?.qrcode, data?.value,
    data?.data?.qrcode, data?.data?.base64, data?.data?.qr, data?.data?.value,
  ];
  return candidates.find((v) => typeof v === 'string' && v.trim().length > 0) || null;
}

function isConnectedPayload(data: any) {
  if (!data) return false;
  if (data.connected === true) return true;
  if (data.status === 'connected') return true;
  const msg = String(data.message || data.error || '').toLowerCase();
  if (['conectado', 'is_loged', 'already_connected', 'connected'].some(k => msg.includes(k))) return true;
  if (data.status === true) return true;
  return false;
}
