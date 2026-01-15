import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendRequest {
  affiliateId?: string;
  phone: string;
  message: string;
  countryCode?: string;
}

const safeJsonParse = (text: string) => {
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return null;
  }
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

const normalizePhone = (phone: string, countryCode: string) => {
  let normalized = String(phone).replace(/\D/g, "");

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
    if (normalized.length === 10 || normalized.length === 11) normalized = prefix + normalized;
  } else {
    if (!normalized.startsWith(prefix)) normalized = prefix + normalized;
  }

  return normalized;
};

const extractBaseHostAndPorts = (backendUrlRaw: string) => {
  const cleanUrl = String(backendUrlRaw).trim().replace(/\/$/, "");
  const match = cleanUrl.match(/^(https?:\/\/[^:\/]+)(?::(\d+))?(.*)$/);
  const baseHost = match ? match[1] : cleanUrl;
  const configuredPort = match?.[2] || "3000";
  const portsToTry = configuredPort === "3001" ? ["3001", "3000"] : ["3000", "3001"];
  return { baseHost, portsToTry };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate caller
    const supabaseAuthed = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseAuthed.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ success: false, error: "Token inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin client
    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { affiliateId, phone, message, countryCode = "BR" }: SendRequest = await req.json();

    if (!phone || !message) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: phone and message are required",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Use the instance linked to the logged-in account (ex: lyronrp@gmail.com)
    const { data: genesisUser } = await supabaseAdmin
      .from("genesis_users")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (!genesisUser?.id) {
      return new Response(
        JSON.stringify({ success: false, error: "Usuário não possui instância WhatsApp vinculada." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: instance } = await supabaseAdmin
      .from("genesis_instances")
      .select("id, name, backend_url, backend_token")
      .eq("user_id", genesisUser.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!instance?.id) {
      return new Response(
        JSON.stringify({ success: false, error: "Nenhuma instância WhatsApp encontrada para sua conta." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Backend config (global preferred)
    const { data: globalConfig } = await supabaseAdmin
      .from("whatsapp_backend_config")
      .select("backend_url, master_token")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const backendUrlRaw = String(globalConfig?.backend_url || instance.backend_url || "").trim();
    const backendToken = String(globalConfig?.master_token || instance.backend_token || "").trim();

    if (!backendUrlRaw || !backendToken) {
      return new Response(
        JSON.stringify({ success: false, error: "Backend do WhatsApp não configurado no sistema" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const normalizedPhone = normalizePhone(phone, countryCode);
    const { baseHost, portsToTry } = extractBaseHostAndPorts(backendUrlRaw);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
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

    const sendPath = `/api/instance/${encodeURIComponent(String(instance.id))}/send`;
    const connectPath = `/api/instance/${encodeURIComponent(String(instance.id))}/connect`;

    const attemptSendOnce = async (baseUrl: string) => {
      const targetUrl = `${baseUrl}${sendPath}`;
      const res = await withTimeout(
        targetUrl,
        { method: "POST", headers, body: JSON.stringify(payload) },
        15000,
      );
      const text = await res.text();
      const parsed = safeJsonParse(text);
      return { res, text, parsed, targetUrl };
    };

    const attemptConnect = async (baseUrl: string) => {
      const targetUrl = `${baseUrl}${connectPath}`;
      const res = await withTimeout(targetUrl, { method: "POST", headers, body: "{}" }, 15000);
      const text = await res.text();
      const parsed = safeJsonParse(text);
      return { res, text, parsed, targetUrl };
    };

    let lastStatus = 0;
    let lastTarget = "";
    let lastDetails: unknown = null;

    for (const port of portsToTry) {
      const baseUrl = `${baseHost}:${port}`;

      // First try send
      const first = await attemptSendOnce(baseUrl);
      lastStatus = first.res.status;
      lastTarget = first.targetUrl;
      lastDetails = first.parsed ?? first.text;

      if (first.res.ok && first.parsed && typeof first.parsed === "object" && (first.parsed as any).success === true) {
        // Log (best effort)
        try {
          await supabaseAdmin.from("whatsapp_message_logs").insert({
            instance_id: String(instance.id),
            contact_phone: normalizedPhone,
            message_type: "text",
            direction: "outbound",
            content: message,
            status: "sent",
            metadata: { source: affiliateId ? "affiliate" : "public", affiliateId: affiliateId || null },
          });
        } catch {
          // ignore
        }

        return new Response(
          JSON.stringify({ success: true, message: "Mensagem enviada com sucesso!", result: first.parsed }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // If backend responded with known "not ready" message, try connect + retry once
      const errText =
        (first.parsed && typeof first.parsed === "object" && ((first.parsed as any).error || (first.parsed as any).message))
          ? String((first.parsed as any).error || (first.parsed as any).message)
          : typeof first.text === "string"
            ? first.text
            : "";

      if (first.res.ok && errText.toLowerCase().includes("não está pronta")) {
        console.log("[send-whatsapp-genesis] Instance not ready, trying connect then retry", {
          instanceId: instance.id,
          port,
        });

        await attemptConnect(baseUrl);
        await sleep(2500);

        const second = await attemptSendOnce(baseUrl);
        lastStatus = second.res.status;
        lastTarget = second.targetUrl;
        lastDetails = second.parsed ?? second.text;

        if (second.res.ok && second.parsed && typeof second.parsed === "object" && (second.parsed as any).success === true) {
          return new Response(
            JSON.stringify({ success: true, message: "Mensagem enviada com sucesso!", result: second.parsed }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }

        // Return the real error (avoid returning misleading 404)
        return new Response(
          JSON.stringify({
            success: false,
            error:
              (second.parsed && typeof second.parsed === "object" && ((second.parsed as any).error || (second.parsed as any).message))
                ? String((second.parsed as any).error || (second.parsed as any).message)
                : `Falha ao enviar WhatsApp (${second.res.status || 0})`,
            details: second.parsed ?? second.text,
            last_target: second.targetUrl,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // If it was 404 on this port, try the other port.
      if (first.res.status === 404) continue;

      // Non-404 (real app error) => return immediately
      return new Response(
        JSON.stringify({
          success: false,
          error:
            (first.parsed && typeof first.parsed === "object" && ((first.parsed as any).error || (first.parsed as any).message))
              ? String((first.parsed as any).error || (first.parsed as any).message)
              : `Falha ao enviar WhatsApp (${first.res.status || 0})`,
          details: first.parsed ?? first.text,
          last_target: first.targetUrl,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: `Falha ao enviar WhatsApp (${lastStatus || 0})`,
        details: lastDetails,
        last_target: lastTarget,
      }),
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
