import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// INSTÂNCIA GLOBAL NATIVA - usada para TODOS os afiliados
const GLOBAL_GENESIS_INSTANCE_ID = 'b2b6cf5a-2e15-4f79-94fb-396385077658';

// Native VPS fallback (GenesisPro backend)
// (mantido aqui para garantir envio mesmo se backend_url/backend_token estiverem vazios na instância)
const NATIVE_VPS_URL = 'http://72.62.108.24:3000';
const NATIVE_VPS_TOKEN = 'genesis-master-token-2024-secure';

interface SendRequest {
  affiliateId?: string; // Opcional - pode vir de templates públicos
  phone: string;
  message: string;
  countryCode?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { affiliateId, phone, message, countryCode = 'BR' }: SendRequest = await req.json();

    // affiliateId é opcional, apenas phone e message são obrigatórios
    if (!phone || !message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: phone and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Não precisamos mais do affiliate, vamos usar a instância global diretamente
    // Mantemos a validação do affiliateId apenas para logging

    // USAR INSTÂNCIA GLOBAL NATIVA
    // Não depende mais de affiliate_prospect_settings ou instâncias do usuário
    const instanceId = GLOBAL_GENESIS_INSTANCE_ID;
    
    console.log(`[send-whatsapp-genesis] Usando instância global: ${instanceId}`);

    // Get global instance details
    const { data: instance, error: instError } = await supabase
      .from('genesis_instances')
      .select('id, name, backend_url, backend_token, status')
      .eq('id', instanceId)
      .single();

    if (instError || !instance) {
      console.error('[send-whatsapp-genesis] Instância global não encontrada:', instError);
      return new Response(
        JSON.stringify({ success: false, error: 'Instância Genesis global não configurada no sistema' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (instance.status !== 'connected') {
      console.error('[send-whatsapp-genesis] Instância global desconectada');
      return new Response(
        JSON.stringify({ success: false, error: 'Instância Genesis global está desconectada. Contate o suporte.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize phone number
    let normalizedPhone = phone.replace(/\D/g, '');
    
    // Add country code prefix if needed
    const countryPrefixes: Record<string, string> = {
      BR: '55', PT: '351', ES: '34', MX: '52', AR: '54', CO: '57',
      CL: '56', PE: '51', US: '1', UK: '44', DE: '49', FR: '33',
      IT: '39', CA: '1', AU: '61', JP: '81',
    };
    
    const prefix = countryPrefixes[countryCode] || '55';
    
    // For Brazil, handle special cases
    if (countryCode === 'BR') {
      if (normalizedPhone.length === 10 || normalizedPhone.length === 11) {
        normalizedPhone = prefix + normalizedPhone;
      }
    } else {
      // For other countries, add prefix if not present
      if (!normalizedPhone.startsWith(prefix)) {
        normalizedPhone = prefix + normalizedPhone;
      }
    }

    console.log(`[send-whatsapp-genesis] Enviando para ${normalizedPhone} via instância global ${instance.name}`);

    // Send via Genesis backend (multi-compat: GenesisPro/V8/Legacy/Evolution)
    const backendUrl = (instance.backend_url || NATIVE_VPS_URL).replace(/\/$/, '');
    const backendToken = instance.backend_token || NATIVE_VPS_TOKEN;

    if (!backendUrl || !backendToken) {
      console.error('[send-whatsapp-genesis] backend_url/backend_token ausentes');
      return new Response(
        JSON.stringify({ success: false, error: 'Backend do WhatsApp não configurado no sistema' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const backendKey = encodeURIComponent(instance.id);
    const backendName = encodeURIComponent(instance.name);

    // Payload compatível (v8/legacy) + payload evolution
    const v8Payload = {
      phone: normalizedPhone,
      message,
      to: normalizedPhone,
      text: message,
      number: normalizedPhone,
      instanceId: instance.id,
      delay: 1500,
    };

    const evolutionPayload = {
      number: normalizedPhone,
      text: message,
      delay: 1500,
    };

    const headers = {
      'Content-Type': 'application/json',
      // Alguns backends usam Bearer, outros usam apikey
      'Authorization': `Bearer ${backendToken}`,
      'apikey': backendToken,
    };

    const looksLikeMissingRoute = (status: number, bodyText: string) =>
      status === 404 && (bodyText.includes('Cannot POST') || bodyText.includes('Cannot GET'));

    const tryPost = async (url: string, body: unknown) => {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const text = await res.text();
      let parsed: any = null;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = null;
      }

      const ok = res.ok && !(parsed && parsed.success === false);
      return { ok, status: res.status, text, parsed };
    };

    // Rotas GenesisPro / V8 (multi-instância)
    const v8Paths = [
      `/${backendKey}/send-text`,
      `/api/instance/${backendKey}/send`,
      `/api/instance/${backendKey}/send-message`,
      `/api/instance/${backendKey}/sendText`,
      `/api/instance/${backendKey}/send-text`,
    ];

    // Fallback legacy (single-instance)
    const legacyPaths = ['/api/send', '/send'];

    // Fallback Evolution API (quando o backend_url aponta direto para Evolution)
    const evolutionPaths = [`/message/sendText/${backendKey}`, `/message/sendText/${backendName}`];

    let lastStatus = 0;
    let lastText = '';
    let sendResult: any = null;

    for (const p of [...v8Paths, ...legacyPaths]) {
      const url = `${backendUrl}${p}`;
      try {
        const r = await tryPost(url, v8Payload);
        if (r.ok) {
          sendResult = r.parsed ?? { raw: r.text };
          break;
        }
        lastStatus = r.status;
        lastText = r.text;
        if (looksLikeMissingRoute(r.status, r.text)) continue;
      } catch (err) {
        lastText = String(err);
      }
    }

    if (!sendResult) {
      for (const p of evolutionPaths) {
        const url = `${backendUrl}${p}`;
        try {
          const r = await tryPost(url, evolutionPayload);
          if (r.ok) {
            sendResult = r.parsed ?? { raw: r.text };
            break;
          }
          lastStatus = r.status;
          lastText = r.text;
          if (looksLikeMissingRoute(r.status, r.text)) continue;
        } catch (err) {
          lastText = String(err);
        }
      }
    }

    if (!sendResult) {
      const preview = (lastText || '').slice(0, 500);
      console.error('[send-whatsapp-genesis] Falha ao enviar:', lastStatus, preview);
      return new Response(
        JSON.stringify({ success: false, error: `Falha ao enviar WhatsApp (${lastStatus || 0})`, details: preview }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Send result:', sendResult);

    // Log the message (use affiliateId for tracking if available)
    await supabase.from('whatsapp_message_logs').insert({
      instance_id: instanceId,
      contact_phone: normalizedPhone,
      message_type: 'text',
      direction: 'outbound',
      content: message,
      status: 'sent',
      metadata: { source: affiliateId ? 'demo_booking' : 'public_template', affiliateId: affiliateId || null, global_instance: true },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Mensagem enviada com sucesso!',
        result: sendResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
