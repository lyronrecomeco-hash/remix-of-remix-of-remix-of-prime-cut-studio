import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// INSTÂNCIA GLOBAL - usada para TODOS os afiliados (tabela genesis_instances)
const GLOBAL_GENESIS_INSTANCE_ID = "b2b6cf5a-2e15-4f79-94fb-396385077658";

interface SendRequest {
  affiliateId?: string;
  phone: string;
  message: string;
  countryCode?: string;
}

type Attempt = {
  label: string;
  path: string;
  body: unknown;
};

const withTimeout = async (input: string, init: RequestInit, timeoutMs = 15000) => {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(input, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(t);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { affiliateId, phone, message, countryCode = "BR" }: SendRequest =
      await req.json();

    if (!phone || !message) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: phone and message are required",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Selecionar automaticamente a melhor instância disponível (prioriza orchestrated_status=connected)
    const { data: instances, error: instancesError } = await supabase
      .from("genesis_instances")
      .select(
        "id, name, backend_url, backend_token, status, orchestrated_status, effective_status, session_data, updated_at",
      )
      .limit(50);

    if (instancesError || !instances?.length) {
      console.error("[send-whatsapp-genesis] Nenhuma instância encontrada:", instancesError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Nenhuma instância do WhatsApp disponível no sistema",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const scoreInstance = (i: any) => {
      const ready = Boolean(i?.session_data?.ready_to_send);
      let score = ready ? 50 : 0;

      if (i?.orchestrated_status === "connected") score += 300;
      else if (i?.effective_status === "connected") score += 200;
      else if (i?.status === "connected") score += 100;

      // precisa de backend para enviar
      if (!i?.backend_url || !i?.backend_token) score = 0;

      return score;
    };

    const byUpdatedDesc = (a: any, b: any) => {
      const ta = a?.updated_at ? new Date(a.updated_at).getTime() : 0;
      const tb = b?.updated_at ? new Date(b.updated_at).getTime() : 0;
      return tb - ta;
    };

    const sorted = [...instances].sort((a: any, b: any) => {
      const sa = scoreInstance(a);
      const sb = scoreInstance(b);
      if (sb !== sa) return sb - sa;
      return byUpdatedDesc(a, b);
    });

    const instance = sorted.find((i: any) => scoreInstance(i) > 0);

    if (!instance) {
      console.error("[send-whatsapp-genesis] Nenhuma instância conectada/pronta para envio");
      return new Response(
        JSON.stringify({
          success: false,
          error: "WhatsApp não está pronto para enviar no momento. Conecte/reconecte a instância.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log("[send-whatsapp-genesis] Instância selecionada", {
      id: instance.id,
      name: instance.name,
      status: instance.status,
      orchestrated_status: instance.orchestrated_status,
      effective_status: instance.effective_status,
      ready_to_send: Boolean(instance?.session_data?.ready_to_send),
      updated_at: instance.updated_at,
    });


    // Normalize phone
    let normalizedPhone = String(phone).replace(/\D/g, "");

    const countryPrefixes: Record<string, string> = {
      BR: "55",
      PT: "351",
      ES: "34",
      MX: "52",
      AR: "54",
      CO: "57",
      CL: "56",
      PE: "51",
      US: "1",
      UK: "44",
      DE: "49",
      FR: "33",
      IT: "39",
      CA: "1",
      AU: "61",
      JP: "81",
    };

    const prefix = countryPrefixes[countryCode] || "55";

    if (countryCode === "BR") {
      if (normalizedPhone.length === 10 || normalizedPhone.length === 11) {
        normalizedPhone = prefix + normalizedPhone;
      }
    } else {
      if (!normalizedPhone.startsWith(prefix)) {
        normalizedPhone = prefix + normalizedPhone;
      }
    }

    console.log(
      `[send-whatsapp-genesis] Enviando para ${normalizedPhone} usando instância ${instance.name} (${instance.id})`,
    );

    const backendUrlRaw = String(instance.backend_url || "").trim();
    const backendToken = String(instance.backend_token || "").trim();

    if (!backendUrlRaw || !backendToken) {
      console.error("[send-whatsapp-genesis] backend_url/backend_token ausentes");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Backend do WhatsApp não configurado no sistema",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const cleanUrl = backendUrlRaw.replace(/\/$/, "");

    // Tentar múltiplas portas (3000/3001) igual ao proxy
    const urlMatch = cleanUrl.match(/^(https?:\/\/[^:\/]+)(?::(\d+))?(.*)$/);
    const baseHost = urlMatch ? urlMatch[1] : cleanUrl;
    const configuredPort = urlMatch?.[2] || "3000";
    const portsToTry = configuredPort === "3001" ? ["3001", "3000"] : ["3000", "3001"];

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${backendToken}`,
      apikey: backendToken,
    };

    const backendKey = encodeURIComponent(instance.id);
    const backendName = encodeURIComponent(instance.name);

    const looksLikeMissingRoute = (status: number, bodyText: string) =>
      status === 404 && (bodyText.includes("Cannot POST") || bodyText.includes("Cannot GET"));

    const tryPost = async (baseUrl: string, attempt: Attempt) => {
      const targetUrl = `${baseUrl}${attempt.path}`;
      console.log("[send-whatsapp-genesis] Tentando", { label: attempt.label, targetUrl });

       const res = await withTimeout(
        targetUrl,
        {
          method: "POST",
          headers,
          body: JSON.stringify(attempt.body),
        },
        30000,
      );

      const text = await res.text();
      let parsed: any = null;
      try {
        parsed = text ? JSON.parse(text) : {};
      } catch {
        parsed = null;
      }

      const ok = res.ok && !(parsed && parsed.success === false);
      return { ok, status: res.status, text, parsed, targetUrl };
    };

    // Tentativas de envio (prioriza rotas V8 / api/instance)
    const attempts: Attempt[] = [
      {
        label: "v8_instance_messages_send",
        path: `/v8/instance/${backendKey}/messages/send`,
        body: { to: normalizedPhone, message },
      },
      {
        label: "api_instance_send",
        path: `/api/instance/${backendKey}/send`,
        body: { phone: normalizedPhone, message },
      },
      {
        label: "api_instance_send_message",
        path: `/api/instance/${backendKey}/send-message`,
        body: { phone: normalizedPhone, message },
      },
      {
        label: "api_instance_send_text",
        path: `/api/instance/${backendKey}/send-text`,
        body: { phone: normalizedPhone, message },
      },
      {
        label: "api_instance_sendText",
        path: `/api/instance/${backendKey}/sendText`,
        body: { phone: normalizedPhone, message },
      },
      {
        label: "legacy_api_send",
        path: "/api/send",
        body: { phone: normalizedPhone, message },
      },
      {
        label: "legacy_send",
        path: "/send",
        body: { phone: normalizedPhone, message },
      },
      // Evolution API (alguns backends usam esse formato)
      {
        label: "evolution_sendText_by_name",
        path: `/message/sendText/${backendName}`,
        body: { number: normalizedPhone, text: message },
      },
      {
        label: "evolution_sendText_by_id",
        path: `/message/sendText/${backendKey}`,
        body: { number: normalizedPhone, text: message },
      },
    ];

    const tried: Array<{ label: string; targetUrl: string; status: number }> = [];
    let lastStatus = 0;
    let lastText = "";
    let lastTargetUrl = "";
    let sendResult: any = null;

    // Loop portas x tentativas
    for (const port of portsToTry) {
      const baseUrl = `${baseHost}:${port}`;

      for (const attempt of attempts) {
        try {
          const r = await tryPost(baseUrl, attempt);
          tried.push({ label: attempt.label, targetUrl: r.targetUrl, status: r.status });

          if (r.ok) {
            sendResult = r.parsed ?? { raw: r.text };
            console.log("[send-whatsapp-genesis] Sucesso", { label: attempt.label, targetUrl: r.targetUrl });
            break;
          }

          lastStatus = r.status;
          lastText = r.text;
          lastTargetUrl = r.targetUrl;

          // Se rota não existe, tenta próxima
          if (looksLikeMissingRoute(r.status, r.text)) continue;

          // Outros erros (401/403/500) -> ainda assim pode existir outra rota compatível
          continue;
        } catch (err) {
          lastStatus = 0;
          lastText = err instanceof Error ? err.message : String(err);
          lastTargetUrl = `${baseUrl}${attempt.path}`;
          tried.push({ label: attempt.label, targetUrl: lastTargetUrl, status: 0 });
        }
      }

      if (sendResult) break;
    }

    if (!sendResult) {
      const preview = String(lastText || "").slice(0, 500);
      console.error("[send-whatsapp-genesis] Falha ao enviar", { lastStatus, lastTargetUrl, preview });
      return new Response(
        JSON.stringify({
          success: false,
          error: `Falha ao enviar WhatsApp (${lastStatus || 0})`,
          details: preview,
          last_target: lastTargetUrl,
          tried,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Log da mensagem (rastreamento interno)
    await supabase.from("whatsapp_message_logs").insert({
      instance_id: instanceId,
      contact_phone: normalizedPhone,
      message_type: "text",
      direction: "outbound",
      content: message,
      status: "sent",
      metadata: {
        source: affiliateId ? "affiliate" : "public",
        affiliateId: affiliateId || null,
        global_instance: true,
      },
    });

    return new Response(
      JSON.stringify({ success: true, message: "Mensagem enviada com sucesso!", result: sendResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[send-whatsapp-genesis] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Erro interno",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

