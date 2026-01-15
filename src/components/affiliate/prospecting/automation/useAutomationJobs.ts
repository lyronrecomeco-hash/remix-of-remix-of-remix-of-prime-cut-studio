/**
 * PROSPECT AUTOMATION - Hook for managing automation jobs
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AutomationJob, AutomationConfig, GenesisInstance, ExecutionLogEntry } from './types';

export const useAutomationJobs = (affiliateId: string) => {
  const [jobs, setJobs] = useState<AutomationJob[]>([]);
  const [activeJob, setActiveJob] = useState<AutomationJob | null>(null);
  const [instances, setInstances] = useState<GenesisInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Fetch all jobs for the affiliate
  const fetchJobs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('prospect_automation_jobs')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedJobs = (data || []).map(job => ({
        ...job,
        config: (job.config as unknown) as AutomationConfig,
        execution_log: ((job.execution_log || []) as unknown) as ExecutionLogEntry[],
      })) as AutomationJob[];

      setJobs(mappedJobs);
      // Set active job (running or scheduled)
      const active = mappedJobs.find(j => 
        j.status === 'running' || j.status === 'scheduled' || j.status === 'paused'
      );
      setActiveJob(active || null);
    } catch (error) {
      console.error('Error fetching automation jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [affiliateId]);

  // Fetch Genesis instances
  const fetchInstances = useCallback(async () => {
    try {
      const { data: affiliate } = await supabase
        .from('affiliates')
        .select('user_id')
        .eq('id', affiliateId)
        .single();

      if (!affiliate?.user_id) return;

      const { data } = await supabase
        .from('genesis_instances')
        .select('id, name, phone_number, status')
        .eq('user_id', affiliate.user_id)
        .eq('status', 'connected');

      setInstances(data || []);
    } catch (error) {
      console.error('Error fetching instances:', error);
    }
  }, [affiliateId]);

  // Create a new automation job
  const createJob = async (
    prospectIds: string[],
    config: AutomationConfig
  ): Promise<AutomationJob | null> => {
    try {
      setCreating(true);

      const { data, error } = await supabase
        .from('prospect_automation_jobs')
        .insert({
          affiliate_id: affiliateId,
          genesis_instance_id: config.genesisInstanceId || null,
          prospect_ids: prospectIds,
          status: config.scheduleType === 'scheduled' ? 'scheduled' : 'pending',
          config: JSON.parse(JSON.stringify(config)),
          scheduled_at: config.scheduleType === 'scheduled' ? config.scheduledAt : null,
          total_prospects: prospectIds.length,
          sent_count: 0,
          failed_count: 0,
          current_index: 0,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`Automação criada para ${prospectIds.length} prospects!`);
      
      // Start the job if immediate
      if (config.scheduleType === 'immediate') {
        await startJob(data.id);
      }

      await fetchJobs();
      return data as unknown as AutomationJob;
    } catch (error) {
      console.error('Error creating automation job:', error);
      toast.error('Erro ao criar automação');
      return null;
    } finally {
      setCreating(false);
    }
  };

  // Start a job
  const startJob = async (jobId: string) => {
    try {
      const { error } = await supabase.functions.invoke('prospect-automation-worker', {
        body: { action: 'start', job_id: jobId },
      });

      if (error) throw error;

      await supabase
        .from('prospect_automation_jobs')
        .update({ status: 'running', started_at: new Date().toISOString() })
        .eq('id', jobId);

      toast.success('Automação iniciada!');
      await fetchJobs();
    } catch (error) {
      console.error('Error starting job:', error);
      toast.error('Erro ao iniciar automação');
    }
  };

  // Pause a job
  const pauseJob = async (jobId: string) => {
    try {
      await supabase
        .from('prospect_automation_jobs')
        .update({ status: 'paused', paused_at: new Date().toISOString() })
        .eq('id', jobId);

      toast.success('Automação pausada');
      await fetchJobs();
    } catch (error) {
      console.error('Error pausing job:', error);
      toast.error('Erro ao pausar automação');
    }
  };

  // Resume a job
  const resumeJob = async (jobId: string) => {
    try {
      await supabase
        .from('prospect_automation_jobs')
        .update({ status: 'running', paused_at: null })
        .eq('id', jobId);

      await supabase.functions.invoke('prospect-automation-worker', {
        body: { action: 'resume', job_id: jobId },
      });

      toast.success('Automação retomada!');
      await fetchJobs();
    } catch (error) {
      console.error('Error resuming job:', error);
      toast.error('Erro ao retomar automação');
    }
  };

  // Cancel a job
  const cancelJob = async (jobId: string) => {
    try {
      await supabase
        .from('prospect_automation_jobs')
        .update({ status: 'cancelled', completed_at: new Date().toISOString() })
        .eq('id', jobId);

      toast.success('Automação cancelada');
      await fetchJobs();
    } catch (error) {
      console.error('Error cancelling job:', error);
      toast.error('Erro ao cancelar automação');
    }
  };

  // Delete a job
  const deleteJob = async (jobId: string) => {
    try {
      await supabase
        .from('prospect_automation_jobs')
        .delete()
        .eq('id', jobId);

      toast.success('Automação excluída');
      await fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Erro ao excluir automação');
    }
  };

  // Subscribe to realtime updates
  useEffect(() => {
    fetchJobs();
    fetchInstances();

    const channel = supabase
      .channel('automation-jobs')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prospect_automation_jobs',
          filter: `affiliate_id=eq.${affiliateId}`,
        },
        () => {
          fetchJobs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [affiliateId, fetchJobs, fetchInstances]);

  return {
    jobs,
    activeJob,
    instances,
    loading,
    creating,
    createJob,
    startJob,
    pauseJob,
    resumeJob,
    cancelJob,
    deleteJob,
    refreshJobs: fetchJobs,
  };
};
