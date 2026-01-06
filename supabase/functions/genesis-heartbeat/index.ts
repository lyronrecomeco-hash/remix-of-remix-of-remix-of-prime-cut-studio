import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-instance-token",
};

// Limite de inatividade: 300 segundos (5 minutos) - aumentado para maior estabilidade 24/7
const STALE_THRESHOLD_SECONDS = 300;

// Intervalo de heartbeat esperado: 30 segundos
const HEARTBEAT_INTERVAL_SECONDS = 30;

const isUuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { instanceId, status, phoneNumber, metrics, forceReconnect } = await req.json();
    const instanceToken = req.headers.get("x-instance-token") || "";

    if (!isUuid(instanceId)) {
      // Backwards compatibility / proteção: alguns scripts podem enviar nome (ex: "Genesis").
      // Não derrubamos o worker por isso; apenas ignoramos.
      return new Response(
        JSON.stringify({ success: true, ignored: true, reason: "invalid_instance_id" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get instance and user info - incluir orchestrated_status
    const { data: instance, error: instanceError } = await supabase
      .from("genesis_instances")
      .select("id, user_id, status, effective_status, orchestrated_status, backend_token, session_data, health_status")
      .eq("id", instanceId)
      .single();

    if (instanceError || !instance) {
      console.error("Instance not found:", instanceError);
      return new Response(
        JSON.stringify({ error: "Instance not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validar token se fornecido - aceita backend_token da instância OU MASTER_TOKEN global
    // Se não há token configurado na instância, aceita qualquer heartbeat com token válido (backwards compatibility)
    const expectedBackendToken = (instance as Record<string, unknown>).backend_token as string | null;
    
    // Buscar MASTER_TOKEN global para validação alternativa
    const { data: globalConfig } = await supabase
      .from("whatsapp_backend_config")
      .select("master_token")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    const globalMasterToken = globalConfig?.master_token || null;
    
    // Token nativo hardcoded para fallback (mesmo usado no proxy)
    const NATIVE_MASTER_TOKEN = "genesis-master-token-2024-secure";
    
    // Validação: aceita se token == backend_token da instância OU master_token global OU token nativo
    if (instanceToken) {
      const validTokens = [expectedBackendToken, globalMasterToken, NATIVE_MASTER_TOKEN].filter(Boolean);
      const isValidToken = validTokens.some(valid => valid === instanceToken);
      
      if (!isValidToken && validTokens.length > 0) {
        console.warn("genesis-heartbeat invalid token", {
          instanceId,
          tokenPrefix: String(instanceToken).slice(0, 8),
          hasInstanceToken: !!expectedBackendToken,
          hasGlobalToken: !!globalMasterToken,
        });
        return new Response(
          JSON.stringify({ error: "Invalid token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    // Se não enviou token, permite para backwards compatibility

    const now = new Date().toISOString();
    
    // Determinar status efetivo baseado no heartbeat recebido
    // Regra: CONNECTED na UI só quando ready_to_send = true (anti "conectado fantasma")
    const rawStatus = (status || instance.status) as string;

    const session = (instance as Record<string, unknown>).session_data as Record<string, unknown> | null;
    const readyToSend = session?.ready_to_send === true;

    let effectiveStatus = rawStatus;
    if (rawStatus === "connected" || forceReconnect) {
      effectiveStatus = readyToSend ? "connected" : "connecting";
    } else if (!status) {
      effectiveStatus = (instance.effective_status as string) || rawStatus;
    }

    // FASE 7: Usar orquestrador para mudanças de status
    // Update heartbeat e health diretamente (não são status)
    const updatePayload: Record<string, unknown> = {
      last_heartbeat: now,
      health_status: 'healthy', // Heartbeat recebido = healthy
      last_health_ping: now,
      updated_at: now,
    };

    // Atualizar número apenas se fornecido
    if (phoneNumber) {
      updatePayload.phone_number = phoneNumber;
    }

    const { error: updateError } = await supabase
      .from("genesis_instances")
      .update(updatePayload)
      .eq("id", instanceId);

    if (updateError) {
      console.error("Error updating instance heartbeat:", updateError);
    }

    // FASE 2: Usar orchestrated_status como referência (fonte de verdade)
    // effective_status e status são apenas espelhos sincronizados pela migração
    let transitionChanged = false;
    
    if (instance.orchestrated_status !== effectiveStatus) {
      const { data: transitionResult, error: rpcError } = await supabase.rpc(
        'genesis_orchestrate_status_change',
        {
          p_instance_id: instanceId,
          p_new_status: effectiveStatus,
          p_source: 'heartbeat',
          p_payload: { phoneNumber, metrics, rawStatus },
        }
      );

      if (rpcError) {
        console.warn("Heartbeat orchestrated transition failed:", rpcError.message);
      } else {
        const result = transitionResult as Record<string, unknown>;
        if (result.success && result.changed) {
          transitionChanged = true;
          console.log(`Heartbeat transitioned ${instanceId}: ${result.from} -> ${result.to}`);
        }
      }
    }

    // FASE 3 & 5: Só logar e disparar webhooks se houve mudança REAL via orquestrador
    // Isso elimina loops de "connected" a cada 20s
    if (transitionChanged) {
      const eventType = effectiveStatus === "connected" ? "connected" : "disconnected";
      
      // Log status change event apenas em mudanças reais
      await supabase.from("genesis_event_logs").insert({
        instance_id: instanceId,
        user_id: instance.user_id,
        event_type: eventType,
        severity: eventType === "connected" ? "info" : "warning",
        message: `Instance ${eventType}`,
        details: { previousStatus: instance.orchestrated_status, newStatus: effectiveStatus },
      });

      // Trigger webhooks apenas em mudanças reais
      const { data: webhooks } = await supabase
        .from("genesis_webhooks")
        .select("*")
        .eq("user_id", instance.user_id)
        .eq("is_active", true)
        .contains("events", [eventType]);

      if (webhooks && webhooks.length > 0) {
        for (const webhook of webhooks) {
          try {
            const payload = {
              event: eventType,
              instanceId,
              status: effectiveStatus,
              phoneNumber,
              timestamp: now,
            };

            const response = await fetch(webhook.url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(webhook.secret_key && { "X-Webhook-Secret": webhook.secret_key }),
              },
              body: JSON.stringify(payload),
            });

            // Update webhook status
            await supabase
              .from("genesis_webhooks")
              .update({
                last_triggered_at: now,
                failure_count: response.ok ? 0 : (webhook.failure_count || 0) + 1,
              })
              .eq("id", webhook.id);

            // Log webhook trigger
            await supabase.from("genesis_event_logs").insert({
              instance_id: instanceId,
              user_id: instance.user_id,
              event_type: "webhook_triggered",
              severity: response.ok ? "info" : "warning",
              message: `Webhook ${webhook.name} triggered - ${response.ok ? "Success" : "Failed"}`,
              details: { webhookId: webhook.id, webhookUrl: webhook.url, status: response.status },
            });
          } catch (webhookError) {
            console.error("Webhook error:", webhookError);
            await supabase
              .from("genesis_webhooks")
              .update({ failure_count: (webhook.failure_count || 0) + 1 })
              .eq("id", webhook.id);
          }
        }
      }
    }

    // Consume daily credits for active instance
    const today = new Date().toISOString().split("T")[0];
    const { data: existingUsage } = await supabase
      .from("genesis_credit_usage")
      .select("id")
      .eq("instance_id", instanceId)
      .eq("usage_type", "instance_daily")
      .eq("usage_date", today)
      .single();

    if (!existingUsage && effectiveStatus === "connected") {
      // Charge 15 credits per day per active instance
      await supabase.from("genesis_credit_usage").insert({
        user_id: instance.user_id,
        instance_id: instanceId,
        credits_used: 15,
        usage_type: "instance_daily",
        description: "Consumo diário de instância ativa",
        usage_date: today,
      });

      // Deduct from user credits
      await supabase.rpc("deduct_genesis_credits", {
        p_user_id: instance.user_id,
        p_amount: 15,
      });

      console.log(`Deducted 15 credits for instance ${instanceId}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: effectiveStatus,
        heartbeat: now,
        staleThreshold: STALE_THRESHOLD_SECONDS,
        heartbeatInterval: HEARTBEAT_INTERVAL_SECONDS,
        nextHeartbeat: new Date(Date.now() + HEARTBEAT_INTERVAL_SECONDS * 1000).toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Genesis heartbeat error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
