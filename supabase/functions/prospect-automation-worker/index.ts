import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutomationConfig {
  genesisInstanceId: string;
  minDelaySeconds: number;
  maxDelaySeconds: number;
  typingSimulation: boolean;
  typingDurationMin: number;
  typingDurationMax: number;
  jitterPercent: number;
  stopOnErrors: boolean;
  maxConsecutiveErrors: number;
}

const getRandomDelay = (min: number, max: number, jitterPercent: number): number => {
  const base = min + Math.random() * (max - min);
  const jitter = base * (jitterPercent / 100) * (Math.random() - 0.5) * 2;
  return Math.round(base + jitter);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, job_id } = await req.json();

    if (action === 'start' || action === 'resume') {
      // Get job
      const { data: job, error: jobError } = await supabase
        .from('prospect_automation_jobs')
        .select('*')
        .eq('id', job_id)
        .single();

      if (jobError || !job) {
        throw new Error('Job not found');
      }

      const config = job.config as AutomationConfig;
      const prospectIds = job.prospect_ids as string[];
      let currentIndex = job.current_index || 0;
      let sentCount = job.sent_count || 0;
      let failedCount = job.failed_count || 0;
      let consecutiveErrors = 0;
      const executionLog = job.execution_log || [];

      // Get instance
      const { data: instance } = await supabase
        .from('genesis_instances')
        .select('*')
        .eq('id', config.genesisInstanceId)
        .single();

      if (!instance) {
        await supabase
          .from('prospect_automation_jobs')
          .update({ status: 'failed', last_error: 'Instância não encontrada' })
          .eq('id', job_id);
        throw new Error('Instance not found');
      }

      // Process prospects
      for (let i = currentIndex; i < prospectIds.length; i++) {
        // Check if job was paused/cancelled
        const { data: currentJob } = await supabase
          .from('prospect_automation_jobs')
          .select('status')
          .eq('id', job_id)
          .single();

        if (currentJob?.status === 'paused' || currentJob?.status === 'cancelled') {
          break;
        }

        const prospectId = prospectIds[i];

        // Get prospect
        const { data: prospect } = await supabase
          .from('affiliate_prospects')
          .select('*')
          .eq('id', prospectId)
          .single();

        if (!prospect || !prospect.company_phone) {
          executionLog.push({
            timestamp: new Date().toISOString(),
            prospectId,
            prospectName: prospect?.company_name || 'Unknown',
            status: 'skipped',
            error: 'Sem telefone',
          });
          continue;
        }

        try {
          // Typing simulation
          if (config.typingSimulation) {
            const typingDuration = config.typingDurationMin + 
              Math.random() * (config.typingDurationMax - config.typingDurationMin);
            await new Promise(r => setTimeout(r, typingDuration * 1000));
          }

          // Send message via Genesis
          const message = prospect.generated_proposal?.message || 
            `Olá! Preparamos uma proposta exclusiva para ${prospect.company_name}!`;

          const { error: sendError } = await supabase.functions.invoke('whatsapp-backend-proxy', {
            body: {
              path: `/v8/instance/${instance.id}/messages/send`,
              method: 'POST',
              body: {
                to: prospect.company_phone.replace(/\D/g, ''),
                message,
              },
            },
          });

          if (sendError) throw sendError;

          // Update prospect status
          await supabase
            .from('affiliate_prospects')
            .update({ status: 'sent', sent_at: new Date().toISOString() })
            .eq('id', prospectId);

          sentCount++;
          consecutiveErrors = 0;

          executionLog.push({
            timestamp: new Date().toISOString(),
            prospectId,
            prospectName: prospect.company_name,
            status: 'sent',
          });

        } catch (error) {
          failedCount++;
          consecutiveErrors++;

          executionLog.push({
            timestamp: new Date().toISOString(),
            prospectId,
            prospectName: prospect.company_name,
            status: 'failed',
            error: error.message,
          });

          if (config.stopOnErrors && consecutiveErrors >= config.maxConsecutiveErrors) {
            await supabase
              .from('prospect_automation_jobs')
              .update({
                status: 'paused',
                last_error: `Parado após ${consecutiveErrors} erros consecutivos`,
                current_index: i + 1,
                sent_count: sentCount,
                failed_count: failedCount,
                execution_log: executionLog,
              })
              .eq('id', job_id);
            break;
          }
        }

        // Update progress
        await supabase
          .from('prospect_automation_jobs')
          .update({
            current_index: i + 1,
            current_prospect_id: prospectId,
            sent_count: sentCount,
            failed_count: failedCount,
            execution_log: executionLog,
          })
          .eq('id', job_id);

        // Delay before next
        if (i < prospectIds.length - 1) {
          const delay = getRandomDelay(
            config.minDelaySeconds,
            config.maxDelaySeconds,
            config.jitterPercent
          );
          await new Promise(r => setTimeout(r, delay * 1000));
        }
      }

      // Mark as completed if finished
      const { data: finalJob } = await supabase
        .from('prospect_automation_jobs')
        .select('status, current_index')
        .eq('id', job_id)
        .single();

      if (finalJob?.status === 'running' && finalJob.current_index >= prospectIds.length) {
        await supabase
          .from('prospect_automation_jobs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', job_id);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Automation worker error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
