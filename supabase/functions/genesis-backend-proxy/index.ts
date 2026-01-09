import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type ProxyRequestBody = {
  instanceId?: string;
  path?: string;
  method?: "GET" | "POST" | "DELETE";
  body?: unknown;
  // Direct mode for VPS testing (Owner panel)
  action?: string;
  directUrl?: string;
  directToken?: string;
  // Demo mode for public demo (Sobre page)
  to?: string;
  message?: string;
};

const isAllowedPath = (path: string) => {
  if (!path.startsWith("/")) return false;

  // Health
  if (path === "/health") return true;

  // V8 (multi-instância) - incluindo DELETE para reset
  if (path.startsWith("/api/instance/")) return true;
  if (path.startsWith("/api/instances")) return true;

  // Legacy (v6/v7)
  if (path === "/status") return true;
  if (path === "/connect") return true;
  if (path === "/qrcode") return true;
  if (path === "/disconnect") return true;

  // Compat
  if (path.startsWith("/api/qrcode")) return true;

  // Send
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

    // Parse body early so we can allow public demo-send without auth
    const requestBody = (await req.json().catch(() => null)) as ProxyRequestBody | null;
    const isDemoSend = Boolean(
      requestBody?.action === "demo-send" && requestBody?.to && requestBody?.message
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader && !isDemoSend) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin client (service role)
    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Identify caller (optional for demo-send)
    let user: any = null;
    if (authHeader) {
      const supabaseAuthed = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const {
        data: { user: authedUser },
        error: userError,
      } = await supabaseAuthed.auth.getUser();

      if (userError || !authedUser) {
        if (!isDemoSend) {
          console.warn("genesis-backend-proxy invalid caller jwt", {
            hasUser: Boolean(authedUser),
            error: userError?.message,
          });

          return new Response(JSON.stringify({ error: "Token inválido" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        console.warn("genesis-backend-proxy demo-send without valid jwt", {
          error: userError?.message,
        });
      } else {
        user = authedUser;
      }
    }

    
    // === MODO DIRETO: Para teste de VPS sem instância (Owner panel) ===
    if (requestBody?.action === 'health' && requestBody?.directUrl && requestBody?.directToken) {
      console.log('[genesis-backend-proxy] Direct health check mode', {
        url: requestBody.directUrl?.replace(/\/.*/, '/***'),
      });

      const cleanUrl = requestBody.directUrl.replace(/\/$/, '');
      const targetUrl = `${cleanUrl}/health`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const resp = await fetch(targetUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${requestBody.directToken}`,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const text = await resp.text();
        let parsed: unknown = text;
        try {
          parsed = text ? JSON.parse(text) : {};
        } catch {
          // keep as text
        }

        console.log('[genesis-backend-proxy] Direct health response', {
          status: resp.status,
          ok: resp.ok,
        });

        return new Response(
          JSON.stringify({ ok: resp.ok, status: resp.status, data: parsed }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (err: any) {
        const isAbort = err.name === 'AbortError';
        console.error('[genesis-backend-proxy] Direct health error:', err);

        return new Response(
          JSON.stringify({
            ok: false,
            status: 0,
            error: isAbort ? 'Timeout ao conectar com o backend' : (err.message || 'Erro de conexão'),
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // === MODO DEMO: Envio público via configuração global (Página Sobre) ===
    if (requestBody?.action === 'demo-send' && requestBody?.to && requestBody?.message) {
      console.log('[genesis-backend-proxy] Demo send mode', {
        to: requestBody.to?.replace(/\d{4}$/, '****'),
      });

      try {
        // Configuração global do VPS
        const NATIVE_VPS_URL = "http://72.62.108.24:3000";
        const NATIVE_VPS_TOKEN = "genesis-master-token-2024-secure";

        const { data: globalConfig } = await supabaseAdmin
          .from("whatsapp_backend_config")
          .select("backend_url, master_token")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const backendUrl = globalConfig?.backend_url || NATIVE_VPS_URL;
        const backendToken = globalConfig?.master_token || NATIVE_VPS_TOKEN;

        // Preferir instância da conta do usuário (quando autenticado).
        // Se a página estiver pública (sem login), usar uma instância demo global conectada.
        let genesisUserRow: any = null;

        if (user?.id) {
          const { data: row } = await supabaseAdmin
            .from('genesis_users')
            .select('id, email')
            .eq('auth_user_id', user.id)
            .maybeSingle();

          genesisUserRow = row ?? null;
        }

        const isConnected = (i: any) =>
          i?.orchestrated_status === 'connected' ||
          i?.effective_status === 'connected' ||
          i?.status === 'connected';

        const isReadyToSend = (i: any) => Boolean(i?.session_data?.ready_to_send);

        let connectedInstance: any = null;

        if (genesisUserRow) {
          const { data: userInstances } = await supabaseAdmin
            .from('genesis_instances')
            .select('id, user_id, name, phone_number, orchestrated_status, effective_status, status, session_data, updated_at')
            .eq('user_id', genesisUserRow.id)
            .order('updated_at', { ascending: false })
            .limit(10);

          const connectedAndReady = (userInstances || []).find((i: any) => isConnected(i) && isReadyToSend(i));
          const connectedOnly = (userInstances || []).find((i: any) => isConnected(i));
          connectedInstance = connectedAndReady || connectedOnly || (userInstances || [])[0];

          if (!connectedInstance) {
            return new Response(
              JSON.stringify({
                success: false,
                error: 'Nenhuma instância encontrada na sua conta. Conecte um WhatsApp para testar.',
              }),
              { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } else {
          const { data: instances } = await supabaseAdmin
            .from('genesis_instances')
            .select('id, user_id, name, phone_number, orchestrated_status, effective_status, status, session_data, updated_at')
            .order('updated_at', { ascending: false })
            .limit(30);

          const candidates = (instances || []).filter((i: any) => isConnected(i));
          const connectedAndReady = candidates.find((i: any) => isReadyToSend(i));
          connectedInstance = connectedAndReady || candidates[0];

          if (!connectedInstance) {
            return new Response(
              JSON.stringify({
                success: false,
                error: 'Demonstração temporariamente indisponível. Tente novamente em instantes.',
              }),
              { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }


        // Em V8 o identificador usado nos endpoints é o UUID do banco (instanceId).
        // Ainda assim, tentamos também o name como fallback.
        const candidateKeys = Array.from(
          new Set([
            String(connectedInstance.id),
            connectedInstance.name ? String(connectedInstance.name) : null,
          ].filter(Boolean) as string[])
        );

        const demoUserId = connectedInstance.user_id || genesisUserRow?.id;

        const cleanBackendUrl = String(backendUrl).replace(/\/$/, '');

        console.log('[genesis-backend-proxy] Demo sending message', {
          callerAuthUserId: user?.id || null,
          genesisUserId: genesisUserRow?.id || null,
          instanceId: connectedInstance.id,
          instanceName: connectedInstance.name,
          statuses: {
            orchestrated_status: connectedInstance.orchestrated_status,
            effective_status: connectedInstance.effective_status,
            status: connectedInstance.status,
          },
          ready_to_send: Boolean((connectedInstance as any)?.session_data?.ready_to_send),
          to: requestBody.to?.replace(/\d{4}$/, '****'),
          msgLength: requestBody.message?.length,
        });

        const v8Endpoints = candidateKeys.flatMap((key) => [
          `/api/instance/${encodeURIComponent(key)}/send`,
          `/api/instance/${encodeURIComponent(key)}/send-message`,
          `/api/instance/${encodeURIComponent(key)}/sendText`,
          `/api/instance/${encodeURIComponent(key)}/send-text`,
        ]);

        const payload = {
          instanceId: String(connectedInstance.id),
          to: requestBody.to,
          phone: requestBody.to,
          number: requestBody.to,
          message: requestBody.message,
          text: requestBody.message,
        };

        let lastResp: Response | null = null;
        let lastParsed: any = null;
        let success = false;

        for (const endpoint of v8Endpoints) {
          const sendUrl = `${cleanBackendUrl}${endpoint}`;
          console.log('[genesis-backend-proxy] Trying endpoint:', endpoint);

          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const resp = await fetch(sendUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${backendToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
              signal: controller.signal,
            });

            clearTimeout(timeoutId);
            lastResp = resp;

            const text = await resp.text();
            try {
              lastParsed = text ? JSON.parse(text) : {};
            } catch {
              lastParsed = text;
            }

            // Check for 404 "Cannot POST" - endpoint doesn't exist, try next
            if (resp.status === 404 && typeof lastParsed === 'string' && lastParsed.includes('Cannot POST')) {
              console.log('[genesis-backend-proxy] Endpoint not found, trying next:', endpoint);
              continue;
            }

            console.log('[genesis-backend-proxy] Demo send response', {
              endpoint,
              status: resp.status,
              ok: resp.ok,
              success: lastParsed?.success,
            });

            // Success!
            if (resp.ok && lastParsed?.success !== false && !lastParsed?.error) {
              success = true;
              break;
            }

            // If we got a real error (not 404), stop trying
            if (resp.status !== 404) {
              break;
            }
          } catch (e: any) {
            console.warn('[genesis-backend-proxy] Endpoint failed:', endpoint, e.message);
            continue;
          }
        }

        // Log do evento
        try {
          await supabaseAdmin.from('genesis_event_logs').insert({
            instance_id: connectedInstance.id,
            user_id: demoUserId,
            event_type: success ? 'demo_message_sent' : 'demo_message_error',
            severity: success ? 'info' : 'warning',
            message: success ? 'Mensagem demo enviada' : `Erro demo: ${lastParsed?.error || 'falha'}`,
            details: { to: requestBody.to?.replace(/\d{4}$/, '****'), source: 'sobre_page' },
          });
        } catch (e) {
          console.warn('Failed to log demo event', e);
        }

        return new Response(
          JSON.stringify({ 
            success, 
            data: lastParsed, 
            error: success ? undefined : (lastParsed?.error || lastParsed?.message || 'Falha ao enviar mensagem'),
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (err: any) {
        const isAbort = err.name === 'AbortError';
        console.error('[genesis-backend-proxy] Demo send error:', err);

        return new Response(
          JSON.stringify({
            success: false,
            error: isAbort ? 'Timeout ao enviar mensagem' : (err.message || 'Erro de conexão'),
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // === MODO PADRÃO: Proxy com instância ===
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

    // === CONFIGURAÇÃO NATIVA HARDCODED ===
    // VPS Genesis pré-configurada - funciona out of the box
    const NATIVE_VPS_URL = "http://72.62.108.24:3000";
    const NATIVE_VPS_TOKEN = "genesis-master-token-2024-secure";

    // FASE 3: Buscar configuração GLOBAL da VPS (whatsapp_backend_config) como fonte primária
    // O Owner configura a VPS central, todas as instâncias Genesis usam essa config
    const { data: globalConfig } = await supabaseAdmin
      .from("whatsapp_backend_config")
      .select("backend_url, master_token")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Prioridade: Config GLOBAL > Config da instância > Config NATIVA (fallback final)
    const backendUrl = globalConfig?.backend_url || instance.backend_url || NATIVE_VPS_URL;
    const backendToken = globalConfig?.master_token || instance.backend_token || NATIVE_VPS_TOKEN;

    const configSource = globalConfig?.backend_url 
      ? 'global' 
      : instance.backend_url 
        ? 'instance' 
        : 'native';

    console.log("genesis-backend-proxy config source", {
      instanceId,
      configSource,
      hasGlobalConfig: !!globalConfig?.backend_url,
      hasInstanceConfig: !!instance.backend_url,
      usingNativeFallback: configSource === 'native',
      backendUrl: backendUrl?.replace(/\/.*/, '/***'),
    });

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

    const buildHeaders = (token: string) => {
      const h: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };
      if (method === "POST" || method === "DELETE") {
        h["Content-Type"] = "application/json";
      }
      return h;
    };

    let fetchBody: string | undefined;
    if (method === "POST" || method === "DELETE") {
      fetchBody = JSON.stringify(requestBody?.body ?? {});
    }

    const primaryHeaders = buildHeaders(backendToken);

    // Fallback: quando o token da instância estiver desatualizado, tenta usar o master_token global
    // (mesmo padrão utilizado no proxy do painel Owner).
    let fallbackToken: string | null = null;
    const getFallbackToken = async (): Promise<string | null> => {
      if (fallbackToken !== null) return fallbackToken;
      try {
        const { data: config } = await supabaseAdmin
          .from("whatsapp_backend_config")
          .select("master_token")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        fallbackToken = (config?.master_token as string | null) ?? null;
        return fallbackToken;
      } catch {
        fallbackToken = null;
        return null;
      }
    };

    const fetchWithTimeout = async (url: string, headersForRequest: Record<string, string>) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      const startedAt = Date.now();
      try {
        const resp = await fetch(url, {
          method,
          headers: headersForRequest,
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

    const altBaseUrl = getAlternateBaseUrl(cleanBackendUrl);
    const attemptUrls: Array<{ baseUrl: string; url: string }> = [{ baseUrl: cleanBackendUrl, url: targetUrl }];
    if (altBaseUrl) {
      attemptUrls.push({ baseUrl: altBaseUrl, url: altBaseUrl + path });
    }

    let lastFetchError: unknown = null;

    for (let i = 0; i < attemptUrls.length; i++) {
      const attempt = attemptUrls[i];

      try {
        const doFetch = async (tokenToUse: string) => {
          const headersForReq = buildHeaders(tokenToUse);
          const tokenMode = tokenToUse === backendToken ? "instance" : "fallback";

          diagLog("FETCH_START", {
            targetUrl: attempt.url,
            method,
            hasAuth: Boolean(headersForReq.Authorization),
            bodyLength: fetchBody?.length || 0,
            attempt: i + 1,
            attemptsTotal: attemptUrls.length,
            tokenMode,
          });

          const { resp, duration } = await fetchWithTimeout(attempt.url, headersForReq);

          const text = await resp.text();
          let parsed: unknown = text;

          try {
            parsed = text ? JSON.parse(text) : {};
          } catch {
            // keep as text
          }

          diagLog("FETCH_RESPONSE", {
            duration,
            httpStatus: resp.status,
            httpOk: resp.ok,
            responseLength: text.length,
            responsePreview: text.slice(0, 500),
            parsedType: typeof parsed,
            attempt: i + 1,
            tokenMode,
          });

          return { resp, duration, parsed, text, tokenToUse };
        };

        // 1) tentativa com token principal (config selecionada)
        let result = await doFetch(backendToken);

        // 2) se token inválido (401), tenta tokens alternativos:
        //    - master_token global (se existir)
        //    - token nativo (fallback final)
        if (result.resp.status === 401) {
          const candidates = [await getFallbackToken(), NATIVE_VPS_TOKEN]
            .filter((t): t is string => Boolean(t) && typeof t === "string")
            .filter((t) => t !== backendToken);

          for (const candidate of candidates) {
            const attemptResult = await doFetch(candidate);
            result = attemptResult;

            // se funcionou (não-401), persistir token no registro da instância
            if (attemptResult.resp.status !== 401) {
              try {
                await supabaseAdmin
                  .from("genesis_instances")
                  .update({ backend_token: candidate, updated_at: new Date().toISOString() })
                  .eq("id", instanceId);

                diagLog("BACKEND_TOKEN_UPDATED", {
                  reason: "fallback_token_success",
                  tokenMode: candidate === NATIVE_VPS_TOKEN ? "native" : "global",
                });
              } catch (e) {
                console.warn("Failed to persist backend_token fallback", e);
              }
              break;
            }
          }
        }

        const upstream = result.resp;
        const fetchDuration = result.duration;
        const parsed = result.parsed;
        const text = result.text;

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

        // === Importante: não marcar "enviado" se o backend respondeu 200 mas com payload de erro ===
        // (isso fazia o painel mostrar sucesso mesmo quando a VPS não enviava de verdade)
        const isSend = path.includes('/send');
        const parsedAny = parsed as any;
        const computedOk = isSend
          ? upstream.ok && !parsedAny?.error && parsedAny?.success !== false
          : upstream.ok;

        // Expor erro apenas para falhas de autenticação (para não quebrar fallbacks por 404/rotas)
        const authError = (upstream.status === 401 || upstream.status === 403)
          ? (parsedAny?.error || 'Não autorizado no backend (token inválido)')
          : undefined;

        // Log específico para envio de mensagem (diagnóstico crítico)
        if (isSend) {
          diagLog('SEND_MESSAGE_RESULT', {
            duration: fetchDuration,
            httpStatus: upstream.status,
            httpOk: upstream.ok,
            computedOk,
            parsedError: parsedAny?.error,
            parsedSuccess: parsedAny?.success,
            parsedMessage: parsedAny?.message,
            fullResponse: JSON.stringify(parsed).slice(0, 1000),
          });

          await logEvent(
            computedOk ? 'message_sent' : 'message_error',
            computedOk ? 'info' : 'error',
            computedOk
              ? 'Mensagem enviada com sucesso'
              : `Erro ao enviar mensagem: ${parsedAny?.error || `HTTP ${upstream.status}`}`,
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
          JSON.stringify({ ok: computedOk, status: upstream.status, data: parsed, error: authError }),
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
