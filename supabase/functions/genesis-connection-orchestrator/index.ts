import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Genesis Connection Orchestrator
 * 
 * FASE 7: Autoridade central para transições de status de instâncias.
 * 
 * - Única fonte de verdade para mudanças de estado
 * - Valida transições via state machine
 * - Registra eventos imutáveis
 * - Frontend e VPS APENAS reportam eventos, não escrevem status diretamente
 */

interface OrchestratorRequest {
  instanceId: string;
  action: 'transition' | 'health_ping' | 'get_status';
  newStatus?: string;
  source?: string;
  payload?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Autenticar usuário via JWT
    const authHeader = req.headers.get("authorization");
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (!authError && user) {
        userId = user.id;
      }
    }

    const body: OrchestratorRequest = await req.json();
    const { instanceId, action, newStatus, source = 'frontend', payload = {} } = body;

    if (!instanceId) {
      return new Response(
        JSON.stringify({ success: false, error: "instanceId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar instância e validar ownership
    const { data: instance, error: instanceError } = await supabase
      .from("genesis_instances")
      .select("id, user_id, orchestrated_status, status, effective_status, health_status, last_health_ping")
      .eq("id", instanceId)
      .single();

    if (instanceError || !instance) {
      console.error("[Orchestrator] Instance not found:", instanceId);
      return new Response(
        JSON.stringify({ success: false, error: "Instance not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validar ownership se userId disponível (exceto para heartbeat/vps)
    if (userId && source !== 'vps' && source !== 'heartbeat') {
      // Buscar genesis_user_id
      const { data: genesisUser } = await supabase
        .from("genesis_users")
        .select("id")
        .eq("auth_user_id", userId)
        .single();

      if (!genesisUser || instance.user_id !== genesisUser.id) {
        console.warn("[Orchestrator] Unauthorized access attempt:", { instanceId, userId });
        return new Response(
          JSON.stringify({ success: false, error: "Unauthorized" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const now = new Date().toISOString();

    // === ACTION: GET_STATUS ===
    if (action === 'get_status') {
      return new Response(
        JSON.stringify({
          success: true,
          instanceId,
          orchestrated_status: instance.orchestrated_status,
          status: instance.status,
          effective_status: instance.effective_status,
          health_status: instance.health_status,
          last_health_ping: instance.last_health_ping,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === ACTION: HEALTH_PING ===
    if (action === 'health_ping') {
      const healthStatus = payload.healthy === true ? 'healthy' : 
                          payload.healthy === false ? 'dead' : 'unknown';

      await supabase
        .from("genesis_instances")
        .update({
          last_health_ping: now,
          health_status: healthStatus,
          updated_at: now,
        })
        .eq("id", instanceId);

      console.log(`[Orchestrator] Health ping: ${instanceId} -> ${healthStatus}`);

      return new Response(
        JSON.stringify({
          success: true,
          instanceId,
          health_status: healthStatus,
          last_health_ping: now,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === ACTION: TRANSITION ===
    if (action === 'transition') {
      if (!newStatus) {
        return new Response(
          JSON.stringify({ success: false, error: "newStatus is required for transition" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Chamar função SQL que valida transição e registra evento
      const { data: result, error: rpcError } = await supabase.rpc(
        'genesis_orchestrate_status_change',
        {
          p_instance_id: instanceId,
          p_new_status: newStatus,
          p_source: source,
          p_payload: payload,
        }
      );

      if (rpcError) {
        console.error("[Orchestrator] RPC error:", rpcError);
        return new Response(
          JSON.stringify({ success: false, error: rpcError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const rpcResult = result as Record<string, unknown>;

      // Também atualizar status legado para compatibilidade
      if (rpcResult.success && rpcResult.changed) {
        await supabase
          .from("genesis_instances")
          .update({
            status: newStatus,
            effective_status: newStatus,
            updated_at: now,
          })
          .eq("id", instanceId);
      }

      console.log(`[Orchestrator] Transition: ${instanceId} ${rpcResult.from} -> ${rpcResult.to} (${source})`);

      return new Response(
        JSON.stringify({
          success: rpcResult.success,
          changed: rpcResult.changed,
          from: rpcResult.from,
          to: rpcResult.to,
          error: rpcResult.error,
          event_id: rpcResult.event_id,
        }),
        { 
          status: rpcResult.success ? 200 : 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Orchestrator] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
