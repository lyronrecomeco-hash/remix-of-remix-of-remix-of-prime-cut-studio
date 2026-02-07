
-- Tabela de usuários do bot Telegram
CREATE TABLE public.telbot_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT NOT NULL UNIQUE,
  telegram_username TEXT,
  first_name TEXT,
  last_name TEXT,
  is_active BOOLEAN DEFAULT true,
  is_blocked BOOLEAN DEFAULT false,
  total_queries INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de consultas/queries
CREATE TABLE public.telbot_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_user_id BIGINT NOT NULL,
  query_type TEXT NOT NULL, -- cpf, cnpj, nome, telefone, link_analysis, message_analysis
  query_input TEXT NOT NULL,
  risk_level TEXT, -- baixo, medio, alto, critico
  fraud_type TEXT,
  ai_response TEXT,
  response_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de monitoramento
CREATE TABLE public.telbot_monitoring (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_user_id BIGINT NOT NULL,
  monitor_type TEXT NOT NULL, -- cpf, cnpj, nome
  monitor_value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_checked_at TIMESTAMPTZ,
  last_alert_at TIMESTAMPTZ,
  check_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de alertas enviados
CREATE TABLE public.telbot_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  monitoring_id UUID REFERENCES public.telbot_monitoring(id) ON DELETE CASCADE,
  telegram_user_id BIGINT NOT NULL,
  alert_type TEXT NOT NULL,
  alert_message TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered BOOLEAN DEFAULT false
);

-- Tabela de logs do bot
CREATE TABLE public.telbot_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  log_type TEXT NOT NULL, -- info, warning, error, command
  telegram_user_id BIGINT,
  command TEXT,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_telbot_queries_user ON public.telbot_queries(telegram_user_id);
CREATE INDEX idx_telbot_queries_type ON public.telbot_queries(query_type);
CREATE INDEX idx_telbot_queries_created ON public.telbot_queries(created_at DESC);
CREATE INDEX idx_telbot_monitoring_user ON public.telbot_monitoring(telegram_user_id);
CREATE INDEX idx_telbot_monitoring_active ON public.telbot_monitoring(is_active) WHERE is_active = true;
CREATE INDEX idx_telbot_alerts_user ON public.telbot_alerts(telegram_user_id);
CREATE INDEX idx_telbot_logs_type ON public.telbot_logs(log_type);
CREATE INDEX idx_telbot_logs_created ON public.telbot_logs(created_at DESC);

-- RLS
ALTER TABLE public.telbot_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telbot_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telbot_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telbot_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telbot_logs ENABLE ROW LEVEL SECURITY;

-- Políticas: acesso total para admins autenticados (painel web)
CREATE POLICY "Admins can manage telbot_users" ON public.telbot_users
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage telbot_queries" ON public.telbot_queries
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage telbot_monitoring" ON public.telbot_monitoring
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage telbot_alerts" ON public.telbot_alerts
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage telbot_logs" ON public.telbot_logs
  FOR ALL USING (public.is_admin(auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER update_telbot_users_updated_at
  BEFORE UPDATE ON public.telbot_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_telbot_monitoring_updated_at
  BEFORE UPDATE ON public.telbot_monitoring
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
