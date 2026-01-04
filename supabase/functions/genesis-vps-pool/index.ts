// Genesis VPS Pool Manager Edge Function
// Gerenciamento distribuído de nós VPS com load balancing e failover
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-node-token',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface PoolRequest {
  action: 
    | 'node_heartbeat'      // VPS reporta métricas
    | 'select_node'         // Frontend seleciona melhor nó
    | 'register_node'       // Admin registra novo nó
    | 'list_nodes'          // Listar nós disponíveis
    | 'initiate_failover'   // Iniciar migração de instância
    | 'execute_failover'    // Executar processo de failover
    | 'complete_failover'   // Finalizar failover
    | 'check_offline'       // Detectar nós offline
    | 'assign_instance';    // Atribuir instância a um nó
  
  // Node heartbeat
  node_id?: string;
  cpu_load?: number;
  memory_load?: number;
  instance_count?: number;
  avg_latency?: number;
  
  // Node registration
  name?: string;
  region?: string;
  base_url?: string;
  max_instances?: number;
  api_token?: string;
  
  // Failover
  instance_id?: string;
  failover_id?: string;
  reason?: string;
  target_node_id?: string;
  success?: boolean;
  error_message?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: PoolRequest = await req.json();
    const { action } = body;

    console.log(`[VPS Pool] Action: ${action}`, JSON.stringify(body).slice(0, 200));

    switch (action) {
      // ═══════════════════════════════════════════════════════════════════════
      // NODE HEARTBEAT - VPS reporta métricas de saúde
      // ═══════════════════════════════════════════════════════════════════════
      case 'node_heartbeat': {
        const nodeToken = req.headers.get('x-node-token');
        
        // Validar token do nó
        const { data: node, error: nodeError } = await supabase
          .from('genesis_vps_nodes')
          .select('id, name')
          .eq('id', body.node_id)
          .eq('api_token', nodeToken)
          .single();

        if (nodeError || !node) {
          console.warn('[VPS Pool] Invalid node token for heartbeat');
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid node or token' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Atualizar métricas via RPC
        const { data: result, error: heartbeatError } = await supabase.rpc(
          'genesis_node_heartbeat',
          {
            p_node_id: body.node_id,
            p_cpu_load: body.cpu_load || 0,
            p_memory_load: body.memory_load || 0,
            p_instance_count: body.instance_count || 0,
            p_avg_latency: body.avg_latency || 0,
          }
        );

        if (heartbeatError) {
          console.error('[VPS Pool] Heartbeat error:', heartbeatError);
          return new Response(
            JSON.stringify({ success: false, error: heartbeatError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`[VPS Pool] Node ${node.name} heartbeat OK - Score: ${result?.health_score}`);
        
        return new Response(
          JSON.stringify({ success: true, ...result }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ═══════════════════════════════════════════════════════════════════════
      // SELECT NODE - Selecionar melhor nó para nova instância
      // ═══════════════════════════════════════════════════════════════════════
      case 'select_node': {
        const { data: bestNode, error: selectError } = await supabase.rpc(
          'genesis_select_best_node',
          {
            p_region: body.region || null,
            p_exclude_node_id: null,
          }
        );

        if (selectError) {
          console.error('[VPS Pool] Select node error:', selectError);
          return new Response(
            JSON.stringify({ success: false, error: selectError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!bestNode || bestNode.length === 0) {
          return new Response(
            JSON.stringify({ success: false, error: 'No available nodes', nodes: [] }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`[VPS Pool] Selected node: ${bestNode[0].node_name} (score: ${bestNode[0].health_score})`);

        return new Response(
          JSON.stringify({ success: true, node: bestNode[0] }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ═══════════════════════════════════════════════════════════════════════
      // LIST NODES - Listar nós disponíveis
      // ═══════════════════════════════════════════════════════════════════════
      case 'list_nodes': {
        const { data: nodes, error: listError } = await supabase
          .from('genesis_vps_nodes')
          .select('id, name, region, base_url, max_instances, current_instances, status, health_score, last_heartbeat_at')
          .eq('is_active', true)
          .order('health_score', { ascending: false });

        if (listError) {
          return new Response(
            JSON.stringify({ success: false, error: listError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, nodes: nodes || [] }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ═══════════════════════════════════════════════════════════════════════
      // REGISTER NODE - Registrar novo nó VPS (admin only)
      // ═══════════════════════════════════════════════════════════════════════
      case 'register_node': {
        if (!body.name || !body.base_url || !body.api_token) {
          return new Response(
            JSON.stringify({ success: false, error: 'name, base_url and api_token required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: newNode, error: insertError } = await supabase
          .from('genesis_vps_nodes')
          .insert({
            name: body.name,
            region: body.region || 'br-south',
            base_url: body.base_url,
            max_instances: body.max_instances || 50,
            api_token: body.api_token,
            status: 'offline',
            is_active: true,
          })
          .select('id, name, base_url')
          .single();

        if (insertError) {
          console.error('[VPS Pool] Register node error:', insertError);
          return new Response(
            JSON.stringify({ success: false, error: insertError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`[VPS Pool] Node registered: ${newNode.name} (${newNode.id})`);

        return new Response(
          JSON.stringify({ success: true, node: newNode }),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ═══════════════════════════════════════════════════════════════════════
      // ASSIGN INSTANCE - Atribuir instância a um nó
      // ═══════════════════════════════════════════════════════════════════════
      case 'assign_instance': {
        if (!body.instance_id || !body.node_id) {
          return new Response(
            JSON.stringify({ success: false, error: 'instance_id and node_id required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Atualizar instância com nó
        const { error: assignError } = await supabase
          .from('genesis_instances')
          .update({ 
            vps_node_id: body.node_id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', body.instance_id);

        if (assignError) {
          return new Response(
            JSON.stringify({ success: false, error: assignError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Incrementar contador do nó
        await supabase.rpc('genesis_node_heartbeat', {
          p_node_id: body.node_id,
          p_instance_count: 1, // Will be recounted on next heartbeat
        });

        console.log(`[VPS Pool] Instance ${body.instance_id} assigned to node ${body.node_id}`);

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ═══════════════════════════════════════════════════════════════════════
      // INITIATE FAILOVER - Iniciar migração de instância
      // ═══════════════════════════════════════════════════════════════════════
      case 'initiate_failover': {
        if (!body.instance_id) {
          return new Response(
            JSON.stringify({ success: false, error: 'instance_id required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: result, error: failoverError } = await supabase.rpc(
          'genesis_initiate_failover',
          {
            p_instance_id: body.instance_id,
            p_reason: body.reason || 'manual',
            p_target_node_id: body.target_node_id || null,
          }
        );

        if (failoverError) {
          console.error('[VPS Pool] Initiate failover error:', failoverError);
          return new Response(
            JSON.stringify({ success: false, error: failoverError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`[VPS Pool] Failover initiated for instance ${body.instance_id}:`, result);

        return new Response(
          JSON.stringify(result),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ═══════════════════════════════════════════════════════════════════════
      // EXECUTE FAILOVER - Executar processo completo de failover
      // ═══════════════════════════════════════════════════════════════════════
      case 'execute_failover': {
        if (!body.failover_id) {
          return new Response(
            JSON.stringify({ success: false, error: 'failover_id required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Buscar dados do failover
        const { data: failover, error: fetchError } = await supabase
          .from('genesis_instance_failovers')
          .select(`
            *,
            target_node:genesis_vps_nodes!target_node_id(id, name, base_url, api_token)
          `)
          .eq('id', body.failover_id)
          .single();

        if (fetchError || !failover) {
          return new Response(
            JSON.stringify({ success: false, error: 'Failover not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // 1. Atualizar status para backing_up
        await supabase
          .from('genesis_instance_failovers')
          .update({ status: 'backing_up' })
          .eq('id', body.failover_id);

        // 2. Criar backup da sessão
        const backupResponse = await fetch(`${supabaseUrl}/functions/v1/genesis-session-backup`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            action: 'create_backup',
            instance_id: failover.instance_id,
            backup_type: 'pre_disconnect',
          }),
        });

        const backupResult = await backupResponse.json();
        
        if (!backupResult.success) {
          await supabase.rpc('genesis_complete_failover', {
            p_failover_id: body.failover_id,
            p_success: false,
            p_error_message: 'Backup failed: ' + (backupResult.error || 'Unknown'),
          });
          
          return new Response(
            JSON.stringify({ success: false, error: 'Backup failed', details: backupResult }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // 3. Atualizar status para migrating
        await supabase
          .from('genesis_instance_failovers')
          .update({ 
            status: 'migrating',
            backup_id: backupResult.backup_id,
          })
          .eq('id', body.failover_id);

        // 4. Notificar novo nó para criar instância com restore
        const targetNode = failover.target_node as { base_url: string; api_token: string };
        
        try {
          const createResponse = await fetch(`${targetNode.base_url}/api/instance/${failover.instance_id}/restore`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${targetNode.api_token}`,
            },
            body: JSON.stringify({ backup_id: backupResult.backup_id }),
          });

          if (!createResponse.ok) {
            throw new Error(`Target node returned ${createResponse.status}`);
          }

          // 5. Atualizar status para restoring
          await supabase
            .from('genesis_instance_failovers')
            .update({ status: 'restoring' })
            .eq('id', body.failover_id);

          console.log(`[VPS Pool] Failover ${body.failover_id} - Instance migrating to ${targetNode.base_url}`);

          return new Response(
            JSON.stringify({ 
              success: true, 
              status: 'restoring',
              backup_id: backupResult.backup_id,
              target_url: targetNode.base_url,
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (nodeError) {
          const errorMessage = nodeError instanceof Error ? nodeError.message : 'Unknown error';
          
          await supabase.rpc('genesis_complete_failover', {
            p_failover_id: body.failover_id,
            p_success: false,
            p_error_message: 'Target node error: ' + errorMessage,
          });

          return new Response(
            JSON.stringify({ success: false, error: 'Target node unavailable', details: errorMessage }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // ═══════════════════════════════════════════════════════════════════════
      // COMPLETE FAILOVER - Finalizar processo de failover
      // ═══════════════════════════════════════════════════════════════════════
      case 'complete_failover': {
        if (!body.failover_id) {
          return new Response(
            JSON.stringify({ success: false, error: 'failover_id required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: result } = await supabase.rpc('genesis_complete_failover', {
          p_failover_id: body.failover_id,
          p_success: body.success !== false,
          p_error_message: body.error_message || null,
        });

        console.log(`[VPS Pool] Failover ${body.failover_id} completed: ${body.success !== false ? 'SUCCESS' : 'FAILED'}`);

        return new Response(
          JSON.stringify({ success: true, completed: result }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ═══════════════════════════════════════════════════════════════════════
      // CHECK OFFLINE - Detectar nós offline e iniciar failovers
      // ═══════════════════════════════════════════════════════════════════════
      case 'check_offline': {
        const { data: count, error: checkError } = await supabase.rpc('genesis_detect_offline_nodes');

        if (checkError) {
          console.error('[VPS Pool] Check offline error:', checkError);
          return new Response(
            JSON.stringify({ success: false, error: checkError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`[VPS Pool] Offline check: ${count} failovers initiated`);

        return new Response(
          JSON.stringify({ success: true, failovers_initiated: count }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('[VPS Pool] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
