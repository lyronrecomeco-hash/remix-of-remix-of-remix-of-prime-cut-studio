-- =====================================================
-- GENESIS AUTOMATION SYSTEM - Enterprise Tables (FIXED)
-- =====================================================

-- 1. Regras de automação (evento → ação)
CREATE TABLE IF NOT EXISTS public.genesis_automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID NOT NULL REFERENCES public.genesis_instances(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.genesis_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  -- Evento normalizado
  event_type TEXT NOT NULL,
  -- Filtros determinísticos
  filters JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Ação
  action_type TEXT NOT NULL CHECK (
    action_type IN (
      'start_flow',
      'send_message',
      'trigger_campaign',
      'call_luna',
      'webhook_external'
    )
  ),
  action_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Proteções
  cooldown_minutes INTEGER NOT NULL DEFAULT 60,
  max_executions_per_hour INTEGER NOT NULL DEFAULT 100,
  last_executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 2. Eventos recebidos (ORQUESTRADOR)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.genesis_integration_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID REFERENCES public.genesis_instance_integrations(id) ON DELETE SET NULL,
  instance_id UUID NOT NULL REFERENCES public.genesis_instances(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  event_type TEXT NOT NULL,
  -- Evento original
  raw_event TEXT NOT NULL,
  -- Evento NORMALIZADO (fonte de verdade)
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Identidade externa
  external_id TEXT NOT NULL,
  -- Cliente (quando existir)
  customer_phone TEXT,
  customer_name TEXT,
  -- IDEMPOTÊNCIA GLOBAL
  dedup_hash TEXT NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (dedup_hash)
);

-- =====================================================
-- 3. Logs de automação (AUDITÁVEL)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.genesis_automation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID REFERENCES public.genesis_automation_rules(id) ON DELETE SET NULL,
  instance_id UUID NOT NULL REFERENCES public.genesis_instances(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.genesis_integration_events(id) ON DELETE SET NULL,
  event_type TEXT,
  action_type TEXT NOT NULL,
  action_result TEXT NOT NULL CHECK (
    action_result IN (
      'success',
      'failed',
      'filtered',
      'rate_limited',
      'cooldown',
      'simulated'
    )
  ),
  error_message TEXT,
  credits_consumed INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_automation_rules_instance 
  ON public.genesis_automation_rules(instance_id);

CREATE INDEX IF NOT EXISTS idx_automation_rules_event 
  ON public.genesis_automation_rules(event_type);

CREATE INDEX IF NOT EXISTS idx_integration_events_instance 
  ON public.genesis_integration_events(instance_id);

CREATE INDEX IF NOT EXISTS idx_integration_events_created 
  ON public.genesis_integration_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_automation_logs_rule 
  ON public.genesis_automation_logs(rule_id);

CREATE INDEX IF NOT EXISTS idx_automation_logs_created 
  ON public.genesis_automation_logs(created_at DESC);

-- =====================================================
-- RLS
-- =====================================================
ALTER TABLE public.genesis_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_integration_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_automation_logs ENABLE ROW LEVEL SECURITY;

-- Rules
CREATE POLICY "Users can view own automation rules"
ON public.genesis_automation_rules
FOR SELECT
USING (user_id = public.get_genesis_user_id(auth.uid()));

CREATE POLICY "Users can manage own automation rules"
ON public.genesis_automation_rules
FOR ALL
USING (user_id = public.get_genesis_user_id(auth.uid()))
WITH CHECK (user_id = public.get_genesis_user_id(auth.uid()));

-- Events
CREATE POLICY "Users can view own integration events"
ON public.genesis_integration_events
FOR SELECT
USING (
  instance_id IN (
    SELECT id FROM public.genesis_instances
    WHERE user_id = public.get_genesis_user_id(auth.uid())
  )
);

-- Logs
CREATE POLICY "Users can view own automation logs"
ON public.genesis_automation_logs
FOR SELECT
USING (
  instance_id IN (
    SELECT id FROM public.genesis_instances
    WHERE user_id = public.get_genesis_user_id(auth.uid())
  )
);

-- =====================================================
-- TRIGGERS
-- =====================================================
CREATE TRIGGER update_genesis_automation_rules_updated_at
BEFORE UPDATE ON public.genesis_automation_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- HELPERS
-- =====================================================
-- Incrementa contatos apenas se campanha ativa
CREATE OR REPLACE FUNCTION public.increment_campaign_contacts(p_campaign_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.genesis_campaigns
  SET total_contacts = total_contacts + 1
  WHERE id = p_campaign_id
    AND status IN ('draft','scheduled','running');
END;
$$;