import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Threshold: 5 minutos (300 segundos) - consistente com todo o sistema
const STALE_THRESHOLD_SECONDS = 300;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Este endpoint pode ser chamado por:
    // 1. Frontend autenticado (via supabase.functions.invoke)
    // 2. Cron job externo com secret (opcional)
    // Usamos service role key, então não precisa de auth do usuário

    const now = new Date();
    const staleThreshold = new Date(now.getTime() - STALE_THRESHOLD_SECONDS * 1000);

    console.log(`[genesis-stale-cleanup] Running at ${now.toISOString()}`);
    console.log(`[genesis-stale-cleanup] Stale threshold: ${staleThreshold.toISOString()}`);

    // 1. Buscar instâncias que estão "conectadas" mas com heartbeat antigo
    const { data: staleInstances, error: fetchError } = await supabase
      .from("genesis_instances")
      .select("id, name, user_id, effective_status, last_heartbeat, phone_number")
      .eq("effective_status", "connected")
      .lt("last_heartbeat", staleThreshold.toISOString());

    if (fetchError) {
      console.error("[genesis-stale-cleanup] Error fetching stale instances:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch instances", details: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!staleInstances || staleInstances.length === 0) {
      console.log("[genesis-stale-cleanup] No stale instances found");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No stale instances found",
          checked_at: now.toISOString(),
          threshold_seconds: STALE_THRESHOLD_SECONDS,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[genesis-stale-cleanup] Found ${staleInstances.length} stale instances`);

    // 2. Atualizar cada instância stale para disconnected
    const results: Array<{ id: string; name: string; success: boolean; error?: string }> = [];

    for (const instance of staleInstances) {
      const heartbeatAge = instance.last_heartbeat 
        ? Math.floor((now.getTime() - new Date(instance.last_heartbeat).getTime()) / 1000)
        : Infinity;

      console.log(`[genesis-stale-cleanup] Marking instance ${instance.id} (${instance.name}) as disconnected. Last heartbeat: ${heartbeatAge}s ago`);

      // Atualizar status para disconnected
      const { error: updateError } = await supabase
        .from("genesis_instances")
        .update({
          effective_status: "disconnected",
          status: "disconnected",
          updated_at: now.toISOString(),
        })
        .eq("id", instance.id);

      if (updateError) {
        console.error(`[genesis-stale-cleanup] Error updating instance ${instance.id}:`, updateError);
        results.push({ id: instance.id, name: instance.name, success: false, error: updateError.message });
        continue;
      }

      // 3. Logar o evento de desconexão por stale
      await supabase.from("genesis_event_logs").insert({
        instance_id: instance.id,
        user_id: instance.user_id,
        event_type: "stale_disconnected",
        severity: "warning",
        message: `Instância marcada como desconectada por inatividade (${heartbeatAge}s sem heartbeat)`,
        details: {
          last_heartbeat: instance.last_heartbeat,
          heartbeat_age_seconds: heartbeatAge,
          threshold_seconds: STALE_THRESHOLD_SECONDS,
          cleanup_at: now.toISOString(),
        },
      });

      results.push({ id: instance.id, name: instance.name, success: true });
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`[genesis-stale-cleanup] Completed: ${successCount} updated, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${staleInstances.length} stale instances`,
        results,
        stats: {
          total: staleInstances.length,
          updated: successCount,
          failed: failCount,
        },
        checked_at: now.toISOString(),
        threshold_seconds: STALE_THRESHOLD_SECONDS,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[genesis-stale-cleanup] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Unexpected error", details: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
