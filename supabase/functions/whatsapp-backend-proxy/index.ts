import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type ProxyRequestBody = {
  path: string;
  method: "GET" | "POST";
  body?: unknown;
};

const isAllowedPath = (path: string) => {
  if (!path.startsWith("/")) return false;

  // Health
  if (path === "/health") return true;

  // V8 multi-instance
  if (path.startsWith("/api/instance/")) return true;
  if (path.startsWith("/api/instances")) return true;

  // Legacy single-instance
  if (path === "/status") return true;
  if (path === "/connect") return true;
  if (path === "/disconnect") return true;
  if (path === "/qrcode") return true;

  // Sending
  if (path === "/send" || path === "/api/send") return true;

  // Backwards compatibility
  if (path.startsWith("/api/qrcode")) return true;

  return false;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("whatsapp-backend-proxy request", {
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
      console.warn("whatsapp-backend-proxy invalid caller jwt", {
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

    // Only allow super_admin to use this proxy (Owner panel)
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!roleData || roleData.role !== "super_admin") {
      return new Response(JSON.stringify({ error: "Acesso negado" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json().catch(() => null)) as ProxyRequestBody | null;
    const path = body?.path;
    const method = body?.method;

    if (!path || !method) {
      return new Response(JSON.stringify({ error: "Payload inválido" }), {
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

    // Load current backend config (single-tenant config)
    const { data: config, error: configError } = await supabaseAdmin
      .from("whatsapp_backend_config")
      .select("id, backend_url, master_token")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (configError || !config?.backend_url || !config?.master_token) {
      return new Response(
        JSON.stringify({
          ok: false,
          status: 400,
          error: "Backend VPS não configurado. Salve a URL e o Token primeiro.",
          data: null,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const configuredUrl = String(config.backend_url).replace(/\/$/, "");
    
    // Extrair base URL sem porta para tentar múltiplas portas
    const urlMatch = configuredUrl.match(/^(https?:\/\/[^:\/]+)(?::(\d+))?(.*)$/);
    const baseHost = urlMatch ? urlMatch[1] : configuredUrl;
    const configuredPort = urlMatch?.[2] || '3000';
    
    // Ordem de portas para tentar (prioriza a configurada)
    const portsToTry = configuredPort === '3001' 
      ? ['3001', '3000'] 
      : ['3000', '3001'];

    const headers: Record<string, string> = {
      Authorization: `Bearer ${config.master_token}`,
    };

    let fetchBody: string | undefined;
    if (method === "POST") {
      headers["Content-Type"] = "application/json";
      fetchBody = JSON.stringify(body?.body ?? {});
    }

    const tryFetch = async (baseUrl: string) => {
      const targetUrl = baseUrl + path;
      console.log("whatsapp-backend-proxy forwarding", {
        path,
        method,
        targetUrl,
        hasBody: Boolean(body?.body),
      });

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

      try {
        const upstream = await fetch(targetUrl, {
          method,
          headers,
          body: fetchBody,
          signal: controller.signal,
        });

        clearTimeout(timeout);

        const text = await upstream.text();
        let parsed: unknown = text;

        try {
          parsed = text ? JSON.parse(text) : {};
        } catch {
          // keep as text
        }

        return {
          ok: upstream.ok,
          status: upstream.status,
          data: parsed,
          targetUrl,
          port: baseUrl.match(/:(\d+)$/)?.[1] || '3000',
        };
      } catch (err) {
        clearTimeout(timeout);
        const message = err instanceof Error ? err.message : String(err);
        return {
          ok: false,
          status: 0,
          data: null,
          error: message,
          targetUrl,
          _connectError: true,
        } as const;
      }
    };

    // Tentar cada porta em sequência
    const errors: string[] = [];
    for (const port of portsToTry) {
      const baseUrl = `${baseHost}:${port}`;
      const result = await tryFetch(baseUrl);
      
      if (result.ok || (!result.ok && !(result as any)._connectError)) {
        // Sucesso ou erro de aplicação (não de conexão)
        
        // Se usamos porta diferente da configurada e funcionou, atualizar config
        if (result.ok && port !== configuredPort) {
          console.log(`whatsapp-backend-proxy: Atualizando porta de ${configuredPort} para ${port}`);
          await supabaseAdmin
            .from("whatsapp_backend_config")
            .update({ backend_url: baseUrl })
            .eq("id", config.id);
        }
        
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      // Erro de conexão - guardar e tentar próxima porta
      errors.push(`Porta ${port}: ${(result as any).error || 'Erro de conexão'}`);
      console.warn(`whatsapp-backend-proxy: Falha na porta ${port}, tentando próxima...`);
    }

    // Todas as portas falharam
    return new Response(
      JSON.stringify({
        ok: false,
        status: 0,
        error: "Não foi possível conectar ao VPS após tentar todas as portas. Verifique se o backend está rodando e as portas 3000/3001 estão liberadas no firewall.",
        data: null,
        details: { errors },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    console.error("whatsapp-backend-proxy error:", message);
    return new Response(
      JSON.stringify({ ok: false, status: 0, error: message, data: null }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
