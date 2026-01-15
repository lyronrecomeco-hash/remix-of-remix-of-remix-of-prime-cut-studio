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

const withTimeout = async (
  input: string,
  init: RequestInit,
  timeoutMs = 15000,
) => {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
};

const safeJsonParse = (text: string) => {
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return null;
  }
};

const looksLikeMissingRoute = (status: number, bodyText: string) =>
  status === 404 && (bodyText.includes("Cannot POST") || bodyText.includes("Cannot GET"));

const isConnected = (i: any) =>
  i?.orchestrated_status === "connected" ||
  i?.effective_status === "connected" ||
  i?.status === "connected";

const isBackendFailure = (parsed: any) => {
  if (!parsed || typeof parsed !== "object") return false;
  if (parsed.success === false) return true;
  if (typeof parsed.error === "string" && parsed.error.trim()) return true;
  return false;
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

    // ===== Instância global (como era antes) =====
    const instanceId = GLOBAL_GENESIS_INSTANCE_ID;
    console.log("[send-whatsapp-genesis] Instância global:", instanceId);

    const { data: instance, error: instError } = await supabase
      .from("genesis_instances")
      .select(
        "id, name, backend_url, backend_token, status, orchestrated_status, effective_status, session_data",
      )
      .eq("id", instanceId)
      .maybeSingle();

    if (instError || !instance) {
      console.error("[send-whatsapp-genesis] Instância global não encontrada:", instError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Instância do WhatsApp não está configurada no sistema",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!isConnected(instance)) {
      console.error("[send-whatsapp-genesis] Instância global desconectada", {
        status: instance.status,
        orchestrated_status: instance.orchestrated_status,
        effective_status: instance.effective_status,
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: "WhatsApp está desconectado. Reconecte a instância.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ===== Normalizar telefone =====
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

    // ===== Config do backend (prioriza config global) =====
    const { data: globalConfig } = await supabase
      .from("whatsapp_backend_config")
      .select("backend_url, master_token")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const backendUrlRaw = String(
      globalConfig?.backend_url || instance.backend_url || "",
    ).trim();
    const backendToken = String(
      globalConfig?.master_token || instance.backend_token || "",
    ).trim();

    if (!backendUrlRaw || !backendToken) {
      console.error("[send-whatsapp-genesis] backend_url/master_token ausentes");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Backend do WhatsApp não configurado no sistema",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const cleanUrl = backendUrlRaw.replace(/\/$/, "");

    // Extrair baseHost + porta configurada
    const urlMatch = cleanUrl.match(/^(https?:\/\/[^:\/]+)(?::(\d+))?(.*)$/);
    const baseHost = urlMatch ? urlMatch[1] : cleanUrl;
    const configuredPort = urlMatch?.[2] || "3000";
    const portsToTry = configuredPort === "3001" ? ["3001", "3000"] : ["3000", "3001"];

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${backendToken}`,
      apikey: backendToken,
    };

    // Payload “compatível” (cobre variações: to/phone/number + message/text)
    const payload = {
      instanceId: String(instance.id),
      to: normalizedPhone,
      phone: normalizedPhone,
      number: normalizedPhone,
      message,
      text: message,
    };

    const candidateKeys = Array.from(
      new Set([
        instance.id ? String(instance.id) : null,
        instance.name ? String(instance.name) : null,
      ].filter(Boolean) as string[]),
    );

    const attempts: Attempt[] = [
      // V8 / Multi-instância (mais comum)
      ...candidateKeys.flatMap((key) => {
        const encoded = encodeURIComponent(key);
        return [
          { label: `api_instance_send:${key}`, path: `/api/instance/${encoded}/send`, body: payload },
          { label: `api_instance_send_message:${key}`, path: `/api/instance/${encoded}/send-message`, body: payload },
          { label: `api_instance_sendText:${key}`, path: `/api/instance/${encoded}/sendText`, body: payload },
          { label: `api_instance_send_text:${key}`, path: `/api/instance/${encoded}/send-text`, body: payload },
        ];
      }),

      // Alguns backends expõem isso
      {
        label: "v8_instance_messages_send",
        path: `/v8/instance/${encodeURIComponent(String(instance.id))}/messages/send`,
        body: payload,
      },

      // Legacy
      { label: "legacy_api_send", path: "/api/send", body: payload },
      { label: "legacy_send", path: "/send", body: payload },

      // Evolution (fallback)
      ...(instance.name
        ? [
            {
              label: "evolution_sendText_by_name",
              path: `/message/sendText/${encodeURIComponent(String(instance.name))}`,
              body: payload,
            },
          ]
        : []),
      {
        label: "evolution_sendText_by_id",
        path: `/message/sendText/${encodeURIComponent(String(instance.id))}`,
        body: payload,
      },
    ];

    const tried: Array<{ label: string; targetUrl: string; status: number }> = [];
    let lastStatus = 0;
    let lastText = "";
    let lastTargetUrl = "";
    let sendResult: any = null;

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
        15000,
      );

      const text = await res.text();
      const parsed = safeJsonParse(text);

      const ok = res.ok && !isBackendFailure(parsed);
      return { ok, status: res.status, text, parsed, targetUrl };
    };

    // Regra: só tentar outra porta se NÃO conseguimos falar com a porta atual (status 0 em tudo).
    for (const port of portsToTry) {
      const baseUrl = `${baseHost}:${port}`;
      let portResponded = false;

      for (const attempt of attempts) {
        try {
          const r = await tryPost(baseUrl, attempt);
          tried.push({ label: attempt.label, targetUrl: r.targetUrl, status: r.status });

          if (r.status > 0) portResponded = true;

          if (r.ok) {
            sendResult = r.parsed ?? (r.text ? { raw: r.text } : {});
            console.log("[send-whatsapp-genesis] Sucesso", { label: attempt.label, targetUrl: r.targetUrl });
            break;
          }

          lastStatus = r.status;
          lastText = r.text;
          lastTargetUrl = r.targetUrl;

          // 404 “Cannot POST/GET” => rota não existe, tenta próxima
          if (looksLikeMissingRoute(r.status, r.text)) continue;

          // erro de aplicação (ex.: success=false / error) => pode haver outra rota compatível, continua na MESMA porta
          continue;
        } catch (err) {
          // erro de conexão/timeout
          lastStatus = 0;
          lastText = err instanceof Error ? err.message : String(err);
          lastTargetUrl = `${baseUrl}${attempt.path}`;
          tried.push({ label: attempt.label, targetUrl: lastTargetUrl, status: 0 });
        }
      }

      if (sendResult) break;

      // Se a porta respondeu (alguma requisição retornou status>0), não tentar a próxima porta.
      if (portResponded) break;
    }

    if (!sendResult) {
      const preview = String(lastText || "").slice(0, 800);
      const parsed = safeJsonParse(preview);
      const details =
        parsed && typeof parsed === "object"
          ? (parsed.error || parsed.message || preview)
          : preview;

      console.error("[send-whatsapp-genesis] Falha ao enviar", {
        lastStatus,
        lastTargetUrl,
        details: String(details).slice(0, 200),
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: `Falha ao enviar WhatsApp (${lastStatus || 0})`,
          details,
          last_target: lastTargetUrl,
          tried,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Log (não pode derrubar o envio se falhar)
    try {
      await supabase.from("whatsapp_message_logs").insert({
        instance_id: instance.id,
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
    } catch (e) {
      console.warn("[send-whatsapp-genesis] Falha ao registrar log (ignorado)", e);
    }

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
