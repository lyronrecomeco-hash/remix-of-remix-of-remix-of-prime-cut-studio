import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Instância do WhatsApp usada para o Petshop (ID não é segredo)
const PETSHOP_INSTANCE_ID = "b2b6cf5a-2e15-4f79-94fb-396385077658";

function normalizePhone(phone: string): string {
  let cleaned = String(phone).replace(/\D/g, "");
  if (!cleaned.startsWith("55") && cleaned.length <= 11) {
    cleaned = "55" + cleaned;
  }
  return cleaned;
}

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

const extractBaseHostAndPorts = (backendUrlRaw: string) => {
  const cleanUrl = String(backendUrlRaw).trim().replace(/\/$/, "");
  const match = cleanUrl.match(/^(https?:\/\/[^:\/]+)(?::(\d+))?(.*)$/);
  const baseHost = match ? match[1] : cleanUrl;
  const configuredPort = match?.[2] || "3000";
  const portsToTry = configuredPort === "3001" ? ["3001", "3000"] : ["3000", "3001"];
  return { baseHost, portsToTry };
};

const safeJsonParse = (text: string) => {
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
};

/**
 * O backend pode responder 200 com { success:false, error:"Aguarde 932ms entre mensagens", retryAfter:1 }
 * quando há rate limit. Aqui calculamos um delay confiável para retry.
 */
const getRetryDelayMs = (parsed: any): number | null => {
  if (!parsed || typeof parsed !== "object") return null;

  const retryAfter = (parsed as any).retryAfter;
  if (typeof retryAfter === "number" && retryAfter > 0) {
    // backend costuma mandar em segundos
    return Math.ceil(retryAfter * 1000);
  }

  const err = String((parsed as any).error || (parsed as any).message || "");
  const matchMs = err.match(/Aguarde\s+(\d+)\s*ms/i);
  if (matchMs?.[1]) {
    const ms = Number(matchMs[1]);
    if (Number.isFinite(ms) && ms > 0) return ms;
  }

  return null;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const phone = (body as any)?.phone;
    const message = (body as any)?.message;

    if (!phone || !message) {
      return new Response(
        JSON.stringify({ success: false, error: "Phone e message são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Pega config global (preferencial) e/ou da instância
    const { data: globalConfig } = await supabaseAdmin
      .from("whatsapp_backend_config")
      .select("backend_url, master_token")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: instance } = await supabaseAdmin
      .from("genesis_instances")
      .select("id, backend_url, backend_token")
      .eq("id", PETSHOP_INSTANCE_ID)
      .maybeSingle();

    const backendUrlRaw = String(globalConfig?.backend_url || instance?.backend_url || "").trim();
    const backendToken = String(globalConfig?.master_token || instance?.backend_token || "").trim();
    const instanceId = String(instance?.id || PETSHOP_INSTANCE_ID);

    if (!backendUrlRaw || !backendToken) {
      // Retornamos 200 para não estourar erro no front (o front usa data.success)
      return new Response(
        JSON.stringify({ success: false, error: "Backend do WhatsApp não configurado" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const normalizedPhone = normalizePhone(phone);
    console.log(`[send-petshop-whatsapp] Enviando para: ${normalizedPhone} | instance: ${instanceId}`);

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

    let lastError: any = null;

    // Tentamos em cada porta, e em cada porta tentamos até 3 vezes (para contornar rate limit do backend)
    for (const port of portsToTry) {
      const baseUrl = `${baseHost}:${port}`;
      const sendUrl = `${baseUrl}/api/instance/${encodeURIComponent(instanceId)}/send`;

      for (let attempt = 1; attempt <= 3; attempt++) {
        const res = await withTimeout(
          sendUrl,
          { method: "POST", headers, body: JSON.stringify(payload) },
          15000,
        );

        const text = await res.text();
        const parsed = safeJsonParse(text);

        // Sucesso (várias versões do backend)
        if (res.ok && ((parsed as any)?.success === true || (parsed as any)?.status === "sent")) {
          return new Response(
            JSON.stringify({ success: true, message: "Mensagem enviada com sucesso", result: parsed }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }

        // Se 404 nesse port, tenta o outro (não faz sentido retry)
        if (res.status === 404) {
          lastError = { status: res.status, parsed };
          break;
        }

        // Rate limit (backend responde 200, porém success:false)
        const retryDelayMs = getRetryDelayMs(parsed) || (res.status === 429 ? 1100 : null);
        if (retryDelayMs && attempt < 3) {
          console.warn(
            `[send-petshop-whatsapp] Rate limit detectado. Tentativa ${attempt}/3. Aguardando ${retryDelayMs}ms antes de reenviar...`,
          );
          lastError = { status: res.status, parsed, retryAfterMs: retryDelayMs };
          await sleep(retryDelayMs + 150);
          continue;
        }

        // Erro real (sem retry) ou retries esgotados
        lastError = { status: res.status, parsed };
        break;
      }

      // Se era 404, testa próxima porta; caso contrário, não adianta tentar outra porta
      if (lastError?.status === 404) continue;
      break;
    }

    console.error("[send-petshop-whatsapp] Falha ao enviar:", lastError);

    // Retornamos 200 para evitar erro hard no front; quem chama decide o que fazer.
    return new Response(
      JSON.stringify({ success: false, error: "Falha ao enviar mensagem", details: lastError }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    console.error("[send-petshop-whatsapp] Erro:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

    // 200 para não quebrar a UI; o front checa success:false
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
