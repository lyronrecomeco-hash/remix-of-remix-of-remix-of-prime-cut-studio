-- =====================================================
-- GOOGLE CALENDAR INTEGRATION - Genesis Flow Builder
-- Tabelas para OAuth, tokens e polling
-- =====================================================

-- 1. Tabela de conexões OAuth do Google Calendar por usuário
CREATE TABLE IF NOT EXISTS public.genesis_google_oauth (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT NOT NULL DEFAULT 'https://www.googleapis.com/auth/calendar',
  token_type TEXT NOT NULL DEFAULT 'Bearer',
  email TEXT, -- Email da conta Google conectada
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_genesis_google_oauth_user_project 
  ON public.genesis_google_oauth(user_id, project_id);

-- RLS
ALTER TABLE public.genesis_google_oauth ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own OAuth connections" 
  ON public.genesis_google_oauth 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Tabela de configurações de calendários monitorados
CREATE TABLE IF NOT EXISTS public.genesis_calendar_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  oauth_id UUID NOT NULL REFERENCES public.genesis_google_oauth(id) ON DELETE CASCADE,
  flow_id UUID NOT NULL, -- Referência ao fluxo que usa este trigger
  calendar_id TEXT NOT NULL DEFAULT 'primary',
  trigger_type TEXT NOT NULL DEFAULT 'event_start', -- event_created, event_updated, event_start
  trigger_config JSONB NOT NULL DEFAULT '{}', -- Ex: { minutes_before: 30 }
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  sync_token TEXT, -- Token incremental do Google para sincronização
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_genesis_calendar_configs_oauth 
  ON public.genesis_calendar_configs(oauth_id);
CREATE INDEX IF NOT EXISTS idx_genesis_calendar_configs_flow 
  ON public.genesis_calendar_configs(flow_id);
CREATE INDEX IF NOT EXISTS idx_genesis_calendar_configs_active 
  ON public.genesis_calendar_configs(is_active) WHERE is_active = true;

-- RLS
ALTER TABLE public.genesis_calendar_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage calendar configs via OAuth owner" 
  ON public.genesis_calendar_configs 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.genesis_google_oauth 
      WHERE id = genesis_calendar_configs.oauth_id 
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.genesis_google_oauth 
      WHERE id = genesis_calendar_configs.oauth_id 
      AND user_id = auth.uid()
    )
  );

-- 3. Tabela de eventos processados (para deduplicação e trigger)
CREATE TABLE IF NOT EXISTS public.genesis_calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID NOT NULL REFERENCES public.genesis_calendar_configs(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL, -- ID do evento no Google Calendar
  event_data JSONB NOT NULL, -- Dados completos do evento
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processed, triggered, failed
  trigger_at TIMESTAMPTZ, -- Quando deve disparar (ex: 30 min antes do início)
  triggered_at TIMESTAMPTZ, -- Quando efetivamente disparou
  execution_id UUID, -- Referência à execução do fluxo
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_genesis_calendar_events_config 
  ON public.genesis_calendar_events(config_id);
CREATE INDEX IF NOT EXISTS idx_genesis_calendar_events_event_id 
  ON public.genesis_calendar_events(event_id);
CREATE INDEX IF NOT EXISTS idx_genesis_calendar_events_trigger_pending 
  ON public.genesis_calendar_events(trigger_at, status) 
  WHERE status = 'pending';
CREATE UNIQUE INDEX IF NOT EXISTS idx_genesis_calendar_events_dedup 
  ON public.genesis_calendar_events(config_id, event_id);

-- RLS
ALTER TABLE public.genesis_calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events via OAuth owner" 
  ON public.genesis_calendar_events 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.genesis_calendar_configs cc
      JOIN public.genesis_google_oauth o ON cc.oauth_id = o.id
      WHERE cc.id = genesis_calendar_events.config_id 
      AND o.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.genesis_calendar_configs cc
      JOIN public.genesis_google_oauth o ON cc.oauth_id = o.id
      WHERE cc.id = genesis_calendar_events.config_id 
      AND o.user_id = auth.uid()
    )
  );

-- 4. Tabela de logs de execução do Calendar (para observabilidade)
CREATE TABLE IF NOT EXISTS public.genesis_calendar_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID REFERENCES public.genesis_calendar_configs(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- oauth_connect, oauth_refresh, list_events, create_event, update_event, delete_event, trigger_fired
  status TEXT NOT NULL DEFAULT 'success', -- success, error
  details JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_genesis_calendar_logs_config 
  ON public.genesis_calendar_logs(config_id, created_at DESC);

-- RLS
ALTER TABLE public.genesis_calendar_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own calendar logs" 
  ON public.genesis_calendar_logs 
  FOR SELECT 
  USING (
    config_id IS NULL OR EXISTS (
      SELECT 1 FROM public.genesis_calendar_configs cc
      JOIN public.genesis_google_oauth o ON cc.oauth_id = o.id
      WHERE cc.id = genesis_calendar_logs.config_id 
      AND o.user_id = auth.uid()
    )
  );

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_genesis_calendar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers de updated_at
DROP TRIGGER IF EXISTS update_genesis_google_oauth_updated_at ON public.genesis_google_oauth;
CREATE TRIGGER update_genesis_google_oauth_updated_at
  BEFORE UPDATE ON public.genesis_google_oauth
  FOR EACH ROW EXECUTE FUNCTION public.update_genesis_calendar_updated_at();

DROP TRIGGER IF EXISTS update_genesis_calendar_configs_updated_at ON public.genesis_calendar_configs;
CREATE TRIGGER update_genesis_calendar_configs_updated_at
  BEFORE UPDATE ON public.genesis_calendar_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_genesis_calendar_updated_at();

DROP TRIGGER IF EXISTS update_genesis_calendar_events_updated_at ON public.genesis_calendar_events;
CREATE TRIGGER update_genesis_calendar_events_updated_at
  BEFORE UPDATE ON public.genesis_calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.update_genesis_calendar_updated_at();