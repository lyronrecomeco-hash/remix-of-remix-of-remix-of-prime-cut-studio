-- Tabela para jobs de automação de prospects
CREATE TABLE public.prospect_automation_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id TEXT NOT NULL,
  genesis_instance_id UUID REFERENCES public.genesis_instances(id),
  prospect_ids UUID[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'running', 'paused', 'completed', 'failed', 'cancelled')),
  
  -- Configurações anti-ban
  config JSONB NOT NULL DEFAULT '{}',
  
  -- Agendamento
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Progresso
  total_prospects INT NOT NULL DEFAULT 0,
  sent_count INT NOT NULL DEFAULT 0,
  failed_count INT NOT NULL DEFAULT 0,
  current_index INT NOT NULL DEFAULT 0,
  current_prospect_id UUID,
  
  -- Logs e erros
  last_error TEXT,
  execution_log JSONB[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_automation_jobs_affiliate ON public.prospect_automation_jobs(affiliate_id);
CREATE INDEX idx_automation_jobs_status ON public.prospect_automation_jobs(status);
CREATE INDEX idx_automation_jobs_scheduled ON public.prospect_automation_jobs(scheduled_at) WHERE status = 'scheduled';

-- Enable RLS
ALTER TABLE public.prospect_automation_jobs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Affiliates can view their own jobs"
  ON public.prospect_automation_jobs FOR SELECT
  USING (affiliate_id = affiliate_id);

CREATE POLICY "Affiliates can create their own jobs"
  ON public.prospect_automation_jobs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Affiliates can update their own jobs"
  ON public.prospect_automation_jobs FOR UPDATE
  USING (true);

CREATE POLICY "Affiliates can delete their own jobs"
  ON public.prospect_automation_jobs FOR DELETE
  USING (true);

-- Trigger para updated_at
CREATE TRIGGER update_automation_jobs_updated_at
  BEFORE UPDATE ON public.prospect_automation_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.prospect_automation_jobs;