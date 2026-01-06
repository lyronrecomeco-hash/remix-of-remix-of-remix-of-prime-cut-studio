import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type ProxyRequestBody = {
  instanceId: string;
  path: string;
  method: "GET" | "POST";
  body?: unknown;
};

const isAllowedPath = (path: string) => {
  if (!path.startsWith("/")) return false;
  if (path === "/health") return true;
  if (path.startsWith("/api/instance/")) return true;
  if (path.startsWith("/api/instances")) return true;
  if (path.startsWith("/api/qrcode")) return true;
  if (path === "/api/send" || path === "/send") return true;
  return false;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("genesis-backend-proxy request", {
    method: req.method,
    hasAuth: Boolean(req.headers.get("Authorization")),
  });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Identify caller (uses anon + caller JWT)
    const supabaseAuthed = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseAuthed.auth.getUser();

    if (userError || !user) {
      console.warn("genesis-backend-proxy invalid caller jwt", {
        hasUser: Boolean(user),
        error: userError?.message,
      });

      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin client (service role)
    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const requestBody = (await req.json().catch(() => null)) as ProxyRequestBody | null;
    const instanceId = requestBody?.instanceId;
    const path = requestBody?.path;
    const method = requestBody?.method;

    if (!instanceId || !path || !method) {
      return new Response(JSON.stringify({ error: "Payload inválido (instanceId, path, method obrigatórios)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isAllowedPath(path)) {
      return new Response(JSON.stringify({ error: "Path não permitido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get genesis user from auth user
    const { data: genesisUser, error: genesisUserError } = await supabaseAdmin
      .from("genesis_users")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (genesisUserError || !genesisUser) {
      return new Response(JSON.stringify({ error: "Usuário Genesis não encontrado" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the instance and verify ownership
    const { data: instance, error: instanceError } = await supabaseAdmin
      .from("genesis_instances")
      .select("id, user_id, backend_url, backend_token")
      .eq("id", instanceId)
      .single();

    if (instanceError || !instance) {
      return new Response(JSON.stringify({ error: "Instância não encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify ownership
    if (instance.user_id !== genesisUser.id) {
      return new Response(JSON.stringify({ error: "Acesso negado a esta instância" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get backend config from instance ONLY - each Genesis instance is independent
    const backendUrl = instance.backend_url;
    const backendToken = instance.backend_token;

    // Validate backend config exists
    if (!backendUrl || !backendToken) {
      return new Response(
        JSON.stringify({
          error: "Configure a URL e Token do backend nas configurações da instância.",
          needsConfig: true,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Block localhost/local backends - must use VPS
    const isLocalBackend = (url: string) => {
      try {
        const parsed = new URL(url);
        return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '0.0.0.0';
      } catch {
        return url.includes('localhost') || url.includes('127.0.0.1') || url.includes('0.0.0.0');
      }
    };

    if (isLocalBackend(backendUrl)) {
      return new Response(
        JSON.stringify({
          error: "Backend local não é suportado. Configure uma URL de VPS válida.",
          needsConfig: true,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const cleanBackendUrl = String(backendUrl).replace(/\/$/, "");
    const targetUrl = cleanBackendUrl + path;

    console.log("genesis-backend-proxy forwarding", {
      instanceId,
      path,
      method,
      targetUrl,
      hasBody: Boolean(requestBody?.body),
    });

    // === FASE 0: DIAGNÓSTICO DETALHADO ===
    const diagLog = (context: string, data: Record<string, unknown>) => {
      console.log(`[DIAG][${context}]`, JSON.stringify({
        instanceId,
        path,
        timestamp: new Date().toISOString(),
        ...data,
      }));
    };

    // Helper to log events
    const logEvent = async (eventType: string, severity: string, message: string, details?: Record<string, unknown>) => {
      try {
        await supabaseAdmin.from('genesis_event_logs').insert({
          instance_id: instanceId,
          user_id: genesisUser.id,
          event_type: eventType,
          severity,
          message,
          details: details || {},
        });
      } catch (e) {
        console.error('Failed to log event:', e);
      }
    };

    const headers: Record<string, string> = {
      Authorization: `Bearer ${backendToken}`,
    };

    let fetchBody: string | undefined;
    if (method === "POST") {
      headers["Content-Type"] = "application/json";
      fetchBody = JSON.stringify(requestBody?.body ?? {});
    }

    diagLog('FETCH_START', {
      targetUrl,
      method,
      hasAuth: Boolean(headers.Authorization),
      bodyLength: fetchBody?.length || 0,
    });

    // === Resiliência: fallback automático de porta (3000/3001) ===
    const getAlternateBaseUrl = (baseUrl: string): string | null => {
      try {
        const u = new URL(baseUrl);
        if (u.port === "3000") u.port = "3001";
        else if (u.port === "3001") u.port = "3000";
        else return null;
        return u.toString().replace(/\/$/, "");
      } catch {
        return null;
      }
    };

    const fetchWithTimeout = async (url: string) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      const startedAt = Date.now();
      try {
        const resp = await fetch(url, {
          method,
          headers,
          body: fetchBody,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return { resp, duration: Date.now() - startedAt };
      } catch (e) {
        clearTimeout(timeoutId);
        throw { error: e, duration: Date.now() - startedAt };
      }
    };

    const altBaseUrl = getAlternateBaseUrl(cleanBackendUrl);
    const attemptUrls: Array<{ baseUrl: string; url: string }> = [{ baseUrl: cleanBackendUrl, url: targetUrl }];
    if (altBaseUrl) {
      attemptUrls.push({ baseUrl: altBaseUrl, url: altBaseUrl + path });
    }

    let lastFetchError: unknown = null;

    for (let i = 0; i < attemptUrls.length; i++) {
      const attempt = attemptUrls[i];

      try {
        diagLog("FETCH_START", {
          targetUrl: attempt.url,
          method,
          hasAuth: Boolean(headers.Authorization),
          bodyLength: fetchBody?.length || 0,
          attempt: i + 1,
          attemptsTotal: attemptUrls.length,
        });

        const { resp: upstream, duration: fetchDuration } = await fetchWithTimeout(attempt.url);

        const text = await upstream.text();
        let parsed: unknown = text;

        try {
          parsed = text ? JSON.parse(text) : {};
        } catch {
          // keep as text
        }

        diagLog("FETCH_RESPONSE", {
          duration: fetchDuration,
          httpStatus: upstream.status,
          httpOk: upstream.ok,
          responseLength: text.length,
          responsePreview: text.slice(0, 500),
          parsedType: typeof parsed,
          attempt: i + 1,
        });

        // Se funcionou na porta alternativa, persistir automaticamente no DB
        if (attempt.baseUrl !== cleanBackendUrl) {
          try {
            await supabaseAdmin
              .from("genesis_instances")
              .update({ backend_url: attempt.baseUrl, updated_at: new Date().toISOString() })
              .eq("id", instanceId);

            diagLog("BACKEND_URL_UPDATED", {
              from: cleanBackendUrl,
              to: attempt.baseUrl,
              reason: "port_fallback_success",
            });
          } catch (e) {
            console.warn("Failed to persist backend_url fallback", e);
          }
        }

        // Log específico para envio de mensagem (diagnóstico crítico)
        if (path.includes('/send')) {
          diagLog('SEND_MESSAGE_RESULT', {
            duration: fetchDuration,
            httpStatus: upstream.status,
            httpOk: upstream.ok,
            parsedError: (parsed as any)?.error,
            parsedSuccess: (parsed as any)?.success,
            parsedMessage: (parsed as any)?.message,
            fullResponse: JSON.stringify(parsed).slice(0, 1000),
          });

          await logEvent(
            upstream.ok ? 'message_sent' : 'message_error',
            upstream.ok ? 'info' : 'error',
            upstream.ok
              ? 'Mensagem enviada com sucesso'
              : `Erro ao enviar mensagem: ${(parsed as any)?.error || `HTTP ${upstream.status}`}`,
            { path, status: upstream.status, duration: fetchDuration, response: parsed }
          );
        } else if (path.includes('/qrcode')) {
          await logEvent('qr_generated', 'info', 'QR Code gerado', { path });
        } else if (path.includes('/status')) {
          const statusData = parsed as Record<string, unknown>;
          diagLog('STATUS_CHECK_RESULT', {
            connected: statusData?.connected,
            status: statusData?.status,
            state: statusData?.state,
            phone: statusData?.phone || statusData?.phoneNumber,
          });
          if (statusData?.connected || statusData?.status === 'connected') {
            await logEvent('connected', 'info', 'Instância conectada', { path, response: parsed });
          }
        }

        return new Response(
          JSON.stringify({ ok: upstream.ok, status: upstream.status, data: parsed }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (fetchErr: any) {
        lastFetchError = fetchErr;
        const fetchDuration = fetchErr?.duration ?? 0;
        const inner = fetchErr?.error ?? fetchErr;
        const isAbort = inner instanceof Error && inner.name === "AbortError";

        diagLog("FETCH_ERROR", {
          duration: fetchDuration,
          isTimeout: isAbort,
          errorType: inner instanceof Error ? inner.name : "unknown",
          errorMessage: inner instanceof Error ? inner.message : String(inner),
          attempt: i + 1,
          targetUrl: attempt.url,
        });

        // Se ainda há tentativas (porta alternativa), continuar
        if (i < attemptUrls.length - 1) continue;

        const errorMsg = isAbort ? "Timeout ao conectar com o backend" : "Backend não está respondendo";

        await logEvent('error', 'error', errorMsg, {
          path,
          isTimeout: isAbort,
          duration: fetchDuration,
        });

        return new Response(
          JSON.stringify({
            error: errorMsg,
            ok: false,
            status: 0,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Nunca deveria chegar aqui
    console.error("Unexpected proxy fallthrough", lastFetchError);
    return new Response(
      JSON.stringify({ error: "Backend não está respondendo", ok: false, status: 0 }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    console.error("genesis-backend-proxy error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
