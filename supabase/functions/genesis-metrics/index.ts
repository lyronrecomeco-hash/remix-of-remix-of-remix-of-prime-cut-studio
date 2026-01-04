import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, ...params } = await req.json();
    console.log(`[genesis-metrics] Action: ${action}`, params);

    switch (action) {
      // ========== MÉTRICAS ==========
      case 'record_metrics': {
        const { instance_id, metrics } = params;
        
        if (!instance_id) {
          throw new Error('instance_id is required');
        }

        const { data, error } = await supabase.rpc('genesis_record_metrics', {
          p_instance_id: instance_id,
          p_metrics: metrics || {}
        });

        if (error) throw error;

        // Avaliar regras de alerta
        await supabase.rpc('genesis_evaluate_alert_rules', {
          p_instance_id: instance_id
        });

        // Calcular health score
        await supabase.rpc('genesis_calculate_health_score', {
          p_instance_id: instance_id
        });

        return new Response(
          JSON.stringify({ success: true, metric_id: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_metrics': {
        const { instance_id, period_type = 'hourly', limit = 24 } = params;

        let query = supabase
          .from('genesis_instance_metrics')
          .select('*')
          .eq('period_type', period_type)
          .order('period_start', { ascending: false })
          .limit(limit);

        if (instance_id) {
          query = query.eq('instance_id', instance_id);
        }

        const { data, error } = await query;
        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, metrics: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_realtime_metrics': {
        const { instance_id } = params;

        let query = supabase
          .from('genesis_realtime_metrics')
          .select(`
            *,
            instance:genesis_instances(id, name, status, phone_number)
          `);

        if (instance_id) {
          query = query.eq('instance_id', instance_id);
        }

        const { data, error } = await query;
        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, realtime: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_dashboard_summary': {
        const { user_id } = params;

        if (!user_id) {
          throw new Error('user_id is required');
        }

        // Buscar instâncias do usuário
        const { data: instances } = await supabase
          .from('genesis_instances')
          .select('id, name, status, orchestrated_status')
          .eq('user_id', user_id);

        const instanceIds = instances?.map(i => i.id) || [];

        // Alertas ativos
        const { data: alerts, count: alertCount } = await supabase
          .from('genesis_alerts')
          .select('*', { count: 'exact' })
          .eq('user_id', user_id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(10);

        // Métricas agregadas das últimas 24h
        const { data: metrics } = await supabase
          .from('genesis_instance_metrics')
          .select('*')
          .in('instance_id', instanceIds)
          .gte('period_start', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        // Calcular totais
        const totals = (metrics || []).reduce((acc, m) => ({
          messages_sent: acc.messages_sent + (m.messages_sent || 0),
          messages_received: acc.messages_received + (m.messages_received || 0),
          messages_failed: acc.messages_failed + (m.messages_failed || 0),
          api_calls: acc.api_calls + (m.api_calls || 0),
          disconnections: acc.disconnections + (m.disconnection_count || 0),
        }), { messages_sent: 0, messages_received: 0, messages_failed: 0, api_calls: 0, disconnections: 0 });

        // Métricas em tempo real
        const { data: realtime } = await supabase
          .from('genesis_realtime_metrics')
          .select('*')
          .in('instance_id', instanceIds);

        const avgHealthScore = realtime?.length 
          ? Math.round(realtime.reduce((acc, r) => acc + (r.health_score || 0), 0) / realtime.length)
          : 100;

        return new Response(
          JSON.stringify({
            success: true,
            summary: {
              instances: {
                total: instances?.length || 0,
                connected: instances?.filter(i => i.status === 'connected').length || 0,
                disconnected: instances?.filter(i => i.status === 'disconnected').length || 0,
              },
              alerts: {
                active: alertCount || 0,
                recent: alerts || [],
              },
              metrics_24h: totals,
              health: {
                average_score: avgHealthScore,
                instances: realtime || [],
              }
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ========== ALERTAS ==========
      case 'create_alert': {
        const { user_id, instance_id, alert_type, severity, title, message, metadata } = params;

        const { data, error } = await supabase.rpc('genesis_create_alert', {
          p_user_id: user_id,
          p_instance_id: instance_id || null,
          p_alert_type: alert_type,
          p_severity: severity || 'warning',
          p_title: title,
          p_message: message,
          p_metadata: metadata || {}
        });

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, alert_id: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_alerts': {
        const { user_id, status = 'active', limit = 50 } = params;

        let query = supabase
          .from('genesis_alerts')
          .select(`
            *,
            instance:genesis_instances(id, name)
          `)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (user_id) {
          query = query.eq('user_id', user_id);
        }

        if (status !== 'all') {
          query = query.eq('status', status);
        }

        const { data, error } = await query;
        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, alerts: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'acknowledge_alert': {
        const { alert_id, user_id } = params;

        const { error } = await supabase
          .from('genesis_alerts')
          .update({
            status: 'acknowledged',
            acknowledged_at: new Date().toISOString(),
            acknowledged_by: user_id
          })
          .eq('id', alert_id);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'resolve_alert': {
        const { alert_id, user_id, resolution_note } = params;

        const { error } = await supabase
          .from('genesis_alerts')
          .update({
            status: 'resolved',
            resolved_at: new Date().toISOString(),
            resolved_by: user_id,
            resolution_note: resolution_note || null
          })
          .eq('id', alert_id);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'dismiss_alert': {
        const { alert_id } = params;

        const { error } = await supabase
          .from('genesis_alerts')
          .update({ status: 'dismissed' })
          .eq('id', alert_id);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ========== REGRAS DE ALERTA ==========
      case 'create_alert_rule': {
        const { 
          user_id, instance_id, name, description,
          metric_type, condition_operator, threshold_value,
          evaluation_window_minutes, alert_severity, cooldown_minutes,
          notify_email, notify_webhook, webhook_url
        } = params;

        const { data, error } = await supabase
          .from('genesis_alert_rules')
          .insert({
            user_id,
            instance_id: instance_id || null,
            name,
            description,
            metric_type,
            condition_operator,
            threshold_value,
            evaluation_window_minutes: evaluation_window_minutes || 60,
            alert_severity: alert_severity || 'warning',
            cooldown_minutes: cooldown_minutes || 30,
            notify_email: notify_email || false,
            notify_webhook: notify_webhook || false,
            webhook_url: webhook_url || null
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, rule: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_alert_rules': {
        const { user_id } = params;

        const { data, error } = await supabase
          .from('genesis_alert_rules')
          .select(`
            *,
            instance:genesis_instances(id, name)
          `)
          .eq('user_id', user_id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, rules: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update_alert_rule': {
        const { rule_id, updates } = params;

        const { data, error } = await supabase
          .from('genesis_alert_rules')
          .update(updates)
          .eq('id', rule_id)
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, rule: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete_alert_rule': {
        const { rule_id } = params;

        const { error } = await supabase
          .from('genesis_alert_rules')
          .delete()
          .eq('id', rule_id);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'toggle_alert_rule': {
        const { rule_id, is_enabled } = params;

        const { error } = await supabase
          .from('genesis_alert_rules')
          .update({ is_enabled })
          .eq('id', rule_id);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ========== HEALTH SCORE ==========
      case 'calculate_health': {
        const { instance_id } = params;

        const { data, error } = await supabase.rpc('genesis_calculate_health_score', {
          p_instance_id: instance_id
        });

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, health_score: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'evaluate_rules': {
        const { instance_id } = params;

        const { data, error } = await supabase.rpc('genesis_evaluate_alert_rules', {
          p_instance_id: instance_id
        });

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, alerts_created: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('[genesis-metrics] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
