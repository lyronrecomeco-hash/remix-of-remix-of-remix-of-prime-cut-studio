import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Instância do WhatsApp usada para o Petshop (ID não é segredo)
const PETSHOP_INSTANCE_ID = 'b2b6cf5a-2e15-4f79-94fb-396385077658';

function normalizePhone(phone: string): string {
  let cleaned = String(phone).replace(/\D/g, '');
  if (!cleaned.startsWith('55') && cleaned.length <= 11) {
    cleaned = '55' + cleaned;
  }
  return cleaned;
}

const withTimeout = async (
  input: string,
  init: RequestInit,
  timeoutMs = 15000,
): Promise<Response> => {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
};

const extractBaseHostAndPorts = (backendUrlRaw: string) => {
  const cleanUrl = String(backendUrlRaw).trim().replace(/\/$/, "");
  const match = cleanUrl.match(/^(https?:\/\/[^:\/]+)(?::(\d+))?(.*)$/);
  const baseHost = match ? match[1] : cleanUrl;
  const configuredPort = match?.[2] || '3000';
  const portsToTry = configuredPort === '3001' ? ['3001', '3000'] : ['3000', '3001'];
  return { baseHost, portsToTry };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, message } = await req.json();

    if (!phone || !message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Phone e message são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Pega config global (preferencial) e/ou da instância
    const { data: globalConfig } = await supabaseAdmin
      .from('whatsapp_backend_config')
      .select('backend_url, master_token')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: instance } = await supabaseAdmin
      .from('genesis_instances')
      .select('id, backend_url, backend_token')
      .eq('id', PETSHOP_INSTANCE_ID)
      .maybeSingle();

    const backendUrlRaw = String(globalConfig?.backend_url || instance?.backend_url || '').trim();
    const backendToken = String(globalConfig?.master_token || instance?.backend_token || '').trim();
    const instanceId = String(instance?.id || PETSHOP_INSTANCE_ID);

    if (!backendUrlRaw || !backendToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'Backend do WhatsApp não configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedPhone = normalizePhone(phone);
    console.log(`[send-petshop-whatsapp] Enviando para: ${normalizedPhone} | instance: ${instanceId}`);

    const { baseHost, portsToTry } = extractBaseHostAndPorts(backendUrlRaw);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${backendToken}`,
      apikey: backendToken,
    };

    const payload = {
      to: normalizedPhone,
      phone: normalizedPhone,
      number: normalizedPhone,
      message,
      text: message,
    };

    let lastError: any = null;

    for (const port of portsToTry) {
      const baseUrl = `${baseHost}:${port}`;
      const sendUrl = `${baseUrl}/api/instance/${encodeURIComponent(instanceId)}/send`;

      const res = await withTimeout(
        sendUrl,
        { method: 'POST', headers, body: JSON.stringify(payload) },
        15000
      );

      const text = await res.text();
      const parsed = (() => {
        try {
          return text ? JSON.parse(text) : {};
        } catch {
          return { raw: text };
        }
      })();

      if (res.ok && (parsed?.success === true || parsed?.status === 'sent')) {
        return new Response(
          JSON.stringify({ success: true, message: 'Mensagem enviada com sucesso', result: parsed }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Se 404 nesse port, tenta o outro
      if (res.status === 404) {
        lastError = { status: res.status, parsed };
        continue;
      }

      lastError = { status: res.status, parsed };
      break;
    }

    console.error('[send-petshop-whatsapp] Falha ao enviar:', lastError);
    return new Response(
      JSON.stringify({ success: false, error: 'Falha ao enviar mensagem', details: lastError }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[send-petshop-whatsapp] Erro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
