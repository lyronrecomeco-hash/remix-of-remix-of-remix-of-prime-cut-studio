import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * PROSPECT AUTOMATION SCHEDULER
 * 
 * This function runs every minute via pg_cron to check for scheduled jobs
 * and start them automatically when their scheduled time arrives.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('[Scheduler] Checking for scheduled jobs...');

    // Get current time in Brazil timezone (UTC-3)
    const now = new Date();
    const brazilTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    const nowISO = now.toISOString();

    console.log('[Scheduler] Current time (UTC):', nowISO);
    console.log('[Scheduler] Current time (Brazil):', brazilTime.toISOString());

    // Find all scheduled jobs where scheduled_at has passed
    const { data: scheduledJobs, error: fetchError } = await supabase
      .from('prospect_automation_jobs')
      .select('id, affiliate_id, scheduled_at, config')
      .eq('status', 'scheduled')
      .lte('scheduled_at', nowISO);

    if (fetchError) {
      console.error('[Scheduler] Error fetching scheduled jobs:', fetchError);
      throw fetchError;
    }

    console.log(`[Scheduler] Found ${scheduledJobs?.length || 0} jobs ready to start`);

    if (!scheduledJobs || scheduledJobs.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No scheduled jobs to start',
        checked_at: nowISO,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = [];

    // Start each scheduled job
    for (const job of scheduledJobs) {
      try {
        console.log(`[Scheduler] Starting job ${job.id} scheduled for ${job.scheduled_at}`);

        // Update job status to running
        const { error: updateError } = await supabase
          .from('prospect_automation_jobs')
          .update({ 
            status: 'running', 
            started_at: nowISO,
          })
          .eq('id', job.id);

        if (updateError) {
          console.error(`[Scheduler] Error updating job ${job.id}:`, updateError);
          results.push({ job_id: job.id, success: false, error: updateError.message });
          continue;
        }

        // Invoke the worker to start processing
        const { error: invokeError } = await supabase.functions.invoke('prospect-automation-worker', {
          body: { action: 'start', job_id: job.id },
        });

        if (invokeError) {
          console.error(`[Scheduler] Error invoking worker for job ${job.id}:`, invokeError);
          // Revert status if worker invocation failed
          await supabase
            .from('prospect_automation_jobs')
            .update({ 
              status: 'scheduled', 
              started_at: null,
              last_error: `Failed to start worker: ${invokeError.message}`,
            })
            .eq('id', job.id);
          results.push({ job_id: job.id, success: false, error: invokeError.message });
          continue;
        }

        console.log(`[Scheduler] Successfully started job ${job.id}`);
        results.push({ job_id: job.id, success: true });

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error(`[Scheduler] Error processing job ${job.id}:`, errorMsg);
        results.push({ job_id: job.id, success: false, error: errorMsg });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`[Scheduler] Completed: ${successCount}/${results.length} jobs started successfully`);

    return new Response(JSON.stringify({ 
      success: true, 
      jobs_checked: scheduledJobs.length,
      jobs_started: successCount,
      results,
      checked_at: nowISO,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Scheduler] Fatal error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
