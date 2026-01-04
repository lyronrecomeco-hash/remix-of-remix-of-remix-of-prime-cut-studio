-- =====================================================
-- FASE 10: MÉTRICAS E ALERTAS AVANÇADOS
-- Sistema completo de monitoramento e alertas
-- =====================================================

-- Tabela de métricas agregadas por instância
CREATE TABLE public.genesis_instance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES public.genesis_instances(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Período da métrica
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  period_type TEXT NOT NULL DEFAULT 'hourly', -- hourly, daily, weekly, monthly
  
  -- Métricas de mensagens
  messages_sent INTEGER DEFAULT 0,
  messages_received INTEGER DEFAULT 0,
  messages_failed INTEGER DEFAULT 0,
  
  -- Métricas de conexão
  connection_uptime_seconds INTEGER DEFAULT 0,
  disconnection_count INTEGER DEFAULT 0,
  reconnection_count INTEGER DEFAULT 0,
  avg_reconnection_time_ms INTEGER DEFAULT 0,
  
  -- Métricas de performance
  avg_response_time_ms INTEGER DEFAULT 0,
  max_response_time_ms INTEGER DEFAULT 0,
  min_response_time_ms INTEGER DEFAULT 0,
  
  -- Métricas de uso
  api_calls INTEGER DEFAULT 0,
  webhook_deliveries INTEGER DEFAULT 0,
  webhook_failures INTEGER DEFAULT 0,
  
  -- Métricas de recursos (da VPS)
  avg_cpu_usage DECIMAL(5,2) DEFAULT 0,
  avg_memory_usage DECIMAL(5,2) DEFAULT 0,
  peak_cpu_usage DECIMAL(5,2) DEFAULT 0,
  peak_memory_usage DECIMAL(5,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(instance_id, period_start, period_type)
);

-- Tabela de alertas
CREATE TABLE public.genesis_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  instance_id UUID REFERENCES public.genesis_instances(id) ON DELETE CASCADE,
  vps_node_id UUID REFERENCES public.genesis_vps_nodes(id) ON DELETE CASCADE,
  
  -- Tipo e severidade
  alert_type TEXT NOT NULL, -- disconnection, high_failure_rate, high_latency, resource_exhaustion, quota_exceeded, node_offline
  severity TEXT NOT NULL DEFAULT 'warning', -- info, warning, critical
  
  -- Detalhes
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  
  -- Estado
  status TEXT NOT NULL DEFAULT 'active', -- active, acknowledged, resolved, dismissed
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  resolution_note TEXT,
  
  -- Auto-resolução
  auto_resolve_after INTERVAL,
  auto_resolved BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de regras de alerta (configuráveis por usuário)
CREATE TABLE public.genesis_alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  instance_id UUID REFERENCES public.genesis_instances(id) ON DELETE CASCADE, -- NULL = aplica a todas
  
  -- Configuração da regra
  name TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT TRUE,
  
  -- Condição
  metric_type TEXT NOT NULL, -- disconnection_count, failure_rate, response_time, cpu_usage, memory_usage, messages_failed
  condition_operator TEXT NOT NULL, -- gt, gte, lt, lte, eq
  threshold_value DECIMAL NOT NULL,
  evaluation_window_minutes INTEGER DEFAULT 60,
  
  -- Ação
  alert_severity TEXT NOT NULL DEFAULT 'warning',
  cooldown_minutes INTEGER DEFAULT 30, -- evita spam de alertas
  
  -- Notificações
  notify_email BOOLEAN DEFAULT FALSE,
  notify_webhook BOOLEAN DEFAULT FALSE,
  webhook_url TEXT,
  
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de métricas em tempo real (para dashboard)
CREATE TABLE public.genesis_realtime_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES public.genesis_instances(id) ON DELETE CASCADE,
  
  -- Snapshot atual
  current_status TEXT NOT NULL,
  last_message_at TIMESTAMPTZ,
  messages_today INTEGER DEFAULT 0,
  uptime_today_seconds INTEGER DEFAULT 0,
  
  -- Métricas de sessão atual
  session_start TIMESTAMPTZ,
  session_messages_sent INTEGER DEFAULT 0,
  session_messages_received INTEGER DEFAULT 0,
  
  -- Health score (0-100)
  health_score INTEGER DEFAULT 100,
  health_factors JSONB DEFAULT '{}',
  
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(instance_id)
);

-- Índices para performance
CREATE INDEX idx_genesis_metrics_instance_period ON public.genesis_instance_metrics(instance_id, period_start DESC);
CREATE INDEX idx_genesis_metrics_user_period ON public.genesis_instance_metrics(user_id, period_type, period_start DESC);
CREATE INDEX idx_genesis_alerts_user_status ON public.genesis_alerts(user_id, status, created_at DESC);
CREATE INDEX idx_genesis_alerts_instance ON public.genesis_alerts(instance_id, status) WHERE instance_id IS NOT NULL;
CREATE INDEX idx_genesis_alerts_severity ON public.genesis_alerts(severity, status) WHERE status = 'active';
CREATE INDEX idx_genesis_alert_rules_user ON public.genesis_alert_rules(user_id, is_enabled);
CREATE INDEX idx_genesis_realtime_instance ON public.genesis_realtime_metrics(instance_id);

-- Habilitar RLS
ALTER TABLE public.genesis_instance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_realtime_metrics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own metrics" ON public.genesis_instance_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert metrics" ON public.genesis_instance_metrics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own alerts" ON public.genesis_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage alerts" ON public.genesis_alerts
  FOR ALL USING (true);

CREATE POLICY "Users can manage own alert rules" ON public.genesis_alert_rules
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own realtime metrics" ON public.genesis_realtime_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.genesis_instances 
      WHERE id = genesis_realtime_metrics.instance_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage realtime metrics" ON public.genesis_realtime_metrics
  FOR ALL USING (true);

-- =====================================================
-- FUNÇÕES DE MÉTRICAS
-- =====================================================

-- Função para registrar métricas de uma instância
CREATE OR REPLACE FUNCTION public.genesis_record_metrics(
  p_instance_id UUID,
  p_metrics JSONB
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_period_start TIMESTAMPTZ;
  v_metric_id UUID;
BEGIN
  -- Buscar user_id da instância
  SELECT user_id INTO v_user_id
  FROM genesis_instances
  WHERE id = p_instance_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Instance not found';
  END IF;
  
  -- Calcular início do período (hora atual truncada)
  v_period_start := date_trunc('hour', now());
  
  -- Inserir ou atualizar métricas
  INSERT INTO genesis_instance_metrics (
    instance_id, user_id, period_start, period_end, period_type,
    messages_sent, messages_received, messages_failed,
    connection_uptime_seconds, disconnection_count, reconnection_count,
    avg_response_time_ms, api_calls, webhook_deliveries, webhook_failures,
    avg_cpu_usage, avg_memory_usage
  ) VALUES (
    p_instance_id, v_user_id, v_period_start, v_period_start + interval '1 hour', 'hourly',
    COALESCE((p_metrics->>'messages_sent')::INTEGER, 0),
    COALESCE((p_metrics->>'messages_received')::INTEGER, 0),
    COALESCE((p_metrics->>'messages_failed')::INTEGER, 0),
    COALESCE((p_metrics->>'uptime_seconds')::INTEGER, 0),
    COALESCE((p_metrics->>'disconnections')::INTEGER, 0),
    COALESCE((p_metrics->>'reconnections')::INTEGER, 0),
    COALESCE((p_metrics->>'avg_response_time')::INTEGER, 0),
    COALESCE((p_metrics->>'api_calls')::INTEGER, 0),
    COALESCE((p_metrics->>'webhook_deliveries')::INTEGER, 0),
    COALESCE((p_metrics->>'webhook_failures')::INTEGER, 0),
    COALESCE((p_metrics->>'cpu_usage')::DECIMAL, 0),
    COALESCE((p_metrics->>'memory_usage')::DECIMAL, 0)
  )
  ON CONFLICT (instance_id, period_start, period_type) DO UPDATE SET
    messages_sent = genesis_instance_metrics.messages_sent + EXCLUDED.messages_sent,
    messages_received = genesis_instance_metrics.messages_received + EXCLUDED.messages_received,
    messages_failed = genesis_instance_metrics.messages_failed + EXCLUDED.messages_failed,
    connection_uptime_seconds = EXCLUDED.connection_uptime_seconds,
    disconnection_count = genesis_instance_metrics.disconnection_count + EXCLUDED.disconnection_count,
    reconnection_count = genesis_instance_metrics.reconnection_count + EXCLUDED.reconnection_count,
    avg_response_time_ms = EXCLUDED.avg_response_time_ms,
    api_calls = genesis_instance_metrics.api_calls + EXCLUDED.api_calls,
    webhook_deliveries = genesis_instance_metrics.webhook_deliveries + EXCLUDED.webhook_deliveries,
    webhook_failures = genesis_instance_metrics.webhook_failures + EXCLUDED.webhook_failures,
    avg_cpu_usage = EXCLUDED.avg_cpu_usage,
    avg_memory_usage = EXCLUDED.avg_memory_usage
  RETURNING id INTO v_metric_id;
  
  -- Atualizar métricas em tempo real
  INSERT INTO genesis_realtime_metrics (
    instance_id, current_status, last_message_at, messages_today,
    session_messages_sent, session_messages_received, health_score, updated_at
  ) VALUES (
    p_instance_id,
    COALESCE(p_metrics->>'status', 'unknown'),
    CASE WHEN (p_metrics->>'last_message_at') IS NOT NULL 
         THEN (p_metrics->>'last_message_at')::TIMESTAMPTZ 
         ELSE NULL END,
    COALESCE((p_metrics->>'messages_today')::INTEGER, 0),
    COALESCE((p_metrics->>'messages_sent')::INTEGER, 0),
    COALESCE((p_metrics->>'messages_received')::INTEGER, 0),
    COALESCE((p_metrics->>'health_score')::INTEGER, 100),
    now()
  )
  ON CONFLICT (instance_id) DO UPDATE SET
    current_status = EXCLUDED.current_status,
    last_message_at = COALESCE(EXCLUDED.last_message_at, genesis_realtime_metrics.last_message_at),
    messages_today = EXCLUDED.messages_today,
    session_messages_sent = EXCLUDED.session_messages_sent,
    session_messages_received = EXCLUDED.session_messages_received,
    health_score = EXCLUDED.health_score,
    updated_at = now();
  
  RETURN v_metric_id;
END;
$$;

-- Função para criar alerta
CREATE OR REPLACE FUNCTION public.genesis_create_alert(
  p_user_id UUID,
  p_instance_id UUID,
  p_alert_type TEXT,
  p_severity TEXT,
  p_title TEXT,
  p_message TEXT,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_alert_id UUID;
  v_existing_alert UUID;
BEGIN
  -- Verificar se já existe alerta ativo similar
  SELECT id INTO v_existing_alert
  FROM genesis_alerts
  WHERE user_id = p_user_id
    AND instance_id IS NOT DISTINCT FROM p_instance_id
    AND alert_type = p_alert_type
    AND status = 'active'
    AND created_at > now() - interval '1 hour';
  
  IF v_existing_alert IS NOT NULL THEN
    -- Atualizar alerta existente
    UPDATE genesis_alerts
    SET metadata = p_metadata,
        message = p_message,
        updated_at = now()
    WHERE id = v_existing_alert;
    
    RETURN v_existing_alert;
  END IF;
  
  -- Criar novo alerta
  INSERT INTO genesis_alerts (
    user_id, instance_id, alert_type, severity,
    title, message, metadata
  ) VALUES (
    p_user_id, p_instance_id, p_alert_type, p_severity,
    p_title, p_message, p_metadata
  ) RETURNING id INTO v_alert_id;
  
  RETURN v_alert_id;
END;
$$;

-- Função para avaliar regras de alerta
CREATE OR REPLACE FUNCTION public.genesis_evaluate_alert_rules(
  p_instance_id UUID
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rule RECORD;
  v_metric_value DECIMAL;
  v_should_trigger BOOLEAN;
  v_alerts_created INTEGER := 0;
  v_instance RECORD;
BEGIN
  -- Buscar dados da instância
  SELECT i.*, rm.health_score, rm.messages_today
  INTO v_instance
  FROM genesis_instances i
  LEFT JOIN genesis_realtime_metrics rm ON rm.instance_id = i.id
  WHERE i.id = p_instance_id;
  
  IF v_instance IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Avaliar cada regra aplicável
  FOR v_rule IN
    SELECT * FROM genesis_alert_rules
    WHERE is_enabled = TRUE
      AND user_id = v_instance.user_id
      AND (instance_id IS NULL OR instance_id = p_instance_id)
      AND (last_triggered_at IS NULL OR last_triggered_at < now() - (cooldown_minutes || ' minutes')::INTERVAL)
  LOOP
    v_should_trigger := FALSE;
    v_metric_value := NULL;
    
    -- Buscar valor da métrica baseado no tipo
    CASE v_rule.metric_type
      WHEN 'disconnection_count' THEN
        SELECT COALESCE(SUM(disconnection_count), 0) INTO v_metric_value
        FROM genesis_instance_metrics
        WHERE instance_id = p_instance_id
          AND period_start > now() - (v_rule.evaluation_window_minutes || ' minutes')::INTERVAL;
          
      WHEN 'failure_rate' THEN
        SELECT CASE 
          WHEN SUM(messages_sent) > 0 
          THEN (SUM(messages_failed)::DECIMAL / SUM(messages_sent)) * 100
          ELSE 0 
        END INTO v_metric_value
        FROM genesis_instance_metrics
        WHERE instance_id = p_instance_id
          AND period_start > now() - (v_rule.evaluation_window_minutes || ' minutes')::INTERVAL;
          
      WHEN 'response_time' THEN
        SELECT COALESCE(AVG(avg_response_time_ms), 0) INTO v_metric_value
        FROM genesis_instance_metrics
        WHERE instance_id = p_instance_id
          AND period_start > now() - (v_rule.evaluation_window_minutes || ' minutes')::INTERVAL;
          
      WHEN 'cpu_usage' THEN
        SELECT COALESCE(AVG(avg_cpu_usage), 0) INTO v_metric_value
        FROM genesis_instance_metrics
        WHERE instance_id = p_instance_id
          AND period_start > now() - (v_rule.evaluation_window_minutes || ' minutes')::INTERVAL;
          
      WHEN 'memory_usage' THEN
        SELECT COALESCE(AVG(avg_memory_usage), 0) INTO v_metric_value
        FROM genesis_instance_metrics
        WHERE instance_id = p_instance_id
          AND period_start > now() - (v_rule.evaluation_window_minutes || ' minutes')::INTERVAL;
          
      WHEN 'health_score' THEN
        v_metric_value := COALESCE(v_instance.health_score, 100);
        
      ELSE
        CONTINUE;
    END CASE;
    
    -- Avaliar condição
    IF v_metric_value IS NOT NULL THEN
      CASE v_rule.condition_operator
        WHEN 'gt' THEN v_should_trigger := v_metric_value > v_rule.threshold_value;
        WHEN 'gte' THEN v_should_trigger := v_metric_value >= v_rule.threshold_value;
        WHEN 'lt' THEN v_should_trigger := v_metric_value < v_rule.threshold_value;
        WHEN 'lte' THEN v_should_trigger := v_metric_value <= v_rule.threshold_value;
        WHEN 'eq' THEN v_should_trigger := v_metric_value = v_rule.threshold_value;
        ELSE v_should_trigger := FALSE;
      END CASE;
    END IF;
    
    -- Criar alerta se condição for atendida
    IF v_should_trigger THEN
      PERFORM genesis_create_alert(
        v_instance.user_id,
        p_instance_id,
        v_rule.metric_type,
        v_rule.alert_severity,
        v_rule.name,
        format('Regra "%s" acionada: %s %s %s (valor atual: %s)',
          v_rule.name, v_rule.metric_type, v_rule.condition_operator, 
          v_rule.threshold_value, v_metric_value),
        jsonb_build_object(
          'rule_id', v_rule.id,
          'metric_value', v_metric_value,
          'threshold', v_rule.threshold_value,
          'operator', v_rule.condition_operator
        )
      );
      
      -- Atualizar regra
      UPDATE genesis_alert_rules
      SET last_triggered_at = now(),
          trigger_count = trigger_count + 1
      WHERE id = v_rule.id;
      
      v_alerts_created := v_alerts_created + 1;
    END IF;
  END LOOP;
  
  RETURN v_alerts_created;
END;
$$;

-- Função para calcular health score
CREATE OR REPLACE FUNCTION public.genesis_calculate_health_score(
  p_instance_id UUID
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_score INTEGER := 100;
  v_factors JSONB := '{}';
  v_instance RECORD;
  v_metrics RECORD;
  v_temp DECIMAL;
BEGIN
  -- Buscar instância
  SELECT * INTO v_instance
  FROM genesis_instances
  WHERE id = p_instance_id;
  
  IF v_instance IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Fator 1: Status de conexão (-30 se desconectado)
  IF v_instance.status != 'connected' THEN
    v_score := v_score - 30;
    v_factors := v_factors || '{"connection": -30}';
  END IF;
  
  -- Fator 2: Heartbeat recente (-20 se > 5 min)
  IF v_instance.last_heartbeat < now() - interval '5 minutes' THEN
    v_score := v_score - 20;
    v_factors := v_factors || '{"heartbeat_stale": -20}';
  END IF;
  
  -- Buscar métricas da última hora
  SELECT 
    COALESCE(SUM(messages_failed), 0) as failures,
    COALESCE(SUM(messages_sent), 0) as sent,
    COALESCE(AVG(avg_response_time_ms), 0) as avg_response,
    COALESCE(SUM(disconnection_count), 0) as disconnections
  INTO v_metrics
  FROM genesis_instance_metrics
  WHERE instance_id = p_instance_id
    AND period_start > now() - interval '1 hour';
  
  -- Fator 3: Taxa de falha (-25 se > 10%)
  IF v_metrics.sent > 0 THEN
    v_temp := (v_metrics.failures::DECIMAL / v_metrics.sent) * 100;
    IF v_temp > 10 THEN
      v_score := v_score - 25;
      v_factors := v_factors || format('{"high_failure_rate": -25, "rate": %s}', v_temp)::JSONB;
    ELSIF v_temp > 5 THEN
      v_score := v_score - 10;
      v_factors := v_factors || format('{"moderate_failure_rate": -10, "rate": %s}', v_temp)::JSONB;
    END IF;
  END IF;
  
  -- Fator 4: Tempo de resposta (-15 se > 5000ms)
  IF v_metrics.avg_response > 5000 THEN
    v_score := v_score - 15;
    v_factors := v_factors || format('{"slow_response": -15, "ms": %s}', v_metrics.avg_response)::JSONB;
  ELSIF v_metrics.avg_response > 2000 THEN
    v_score := v_score - 5;
    v_factors := v_factors || format('{"moderate_response": -5, "ms": %s}', v_metrics.avg_response)::JSONB;
  END IF;
  
  -- Fator 5: Desconexões frequentes (-10 por desconexão, max -30)
  IF v_metrics.disconnections > 0 THEN
    v_temp := LEAST(v_metrics.disconnections * 10, 30);
    v_score := v_score - v_temp::INTEGER;
    v_factors := v_factors || format('{"disconnections": %s, "count": %s}', -v_temp, v_metrics.disconnections)::JSONB;
  END IF;
  
  -- Garantir score entre 0 e 100
  v_score := GREATEST(0, LEAST(100, v_score));
  
  -- Atualizar métricas em tempo real
  UPDATE genesis_realtime_metrics
  SET health_score = v_score,
      health_factors = v_factors,
      updated_at = now()
  WHERE instance_id = p_instance_id;
  
  RETURN v_score;
END;
$$;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_genesis_alerts_updated_at
  BEFORE UPDATE ON public.genesis_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_genesis_alert_rules_updated_at
  BEFORE UPDATE ON public.genesis_alert_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();