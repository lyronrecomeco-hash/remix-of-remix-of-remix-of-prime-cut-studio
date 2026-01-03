-- =====================================================
-- FASE 1: ESTABILIDADE + FLOW BUILDER
-- =====================================================

-- 1. Adicionar colunas para Flow Builder (nós visuais)
ALTER TABLE public.whatsapp_automation_rules 
ADD COLUMN IF NOT EXISTS flow_data jsonb DEFAULT '{"nodes": [], "edges": []}'::jsonb,
ADD COLUMN IF NOT EXISTS flow_version integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS canvas_position jsonb DEFAULT '{"x": 0, "y": 0, "zoom": 1}'::jsonb;

-- 2. Criar tabela para nós do fluxo (para queries mais rápidas)
CREATE TABLE IF NOT EXISTS public.whatsapp_flow_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid REFERENCES public.whatsapp_automation_rules(id) ON DELETE CASCADE,
  node_id text NOT NULL,
  node_type text NOT NULL, -- 'trigger', 'condition', 'action', 'delay', 'split', 'end'
  node_label text,
  node_config jsonb DEFAULT '{}'::jsonb,
  position_x numeric DEFAULT 0,
  position_y numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(rule_id, node_id)
);

-- 3. Criar tabela para conexões entre nós
CREATE TABLE IF NOT EXISTS public.whatsapp_flow_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid REFERENCES public.whatsapp_automation_rules(id) ON DELETE CASCADE,
  edge_id text NOT NULL,
  source_node_id text NOT NULL,
  target_node_id text NOT NULL,
  source_handle text,
  target_handle text,
  edge_label text,
  edge_condition jsonb, -- condição para seguir esta conexão
  created_at timestamptz DEFAULT now(),
  UNIQUE(rule_id, edge_id)
);

-- 4. Melhorar tabela de alertas com mais campos para monitoramento
ALTER TABLE public.whatsapp_alerts 
ADD COLUMN IF NOT EXISTS acknowledged_by uuid,
ADD COLUMN IF NOT EXISTS auto_resolved boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- 5. Adicionar tabela de circuit breaker
CREATE TABLE IF NOT EXISTS public.whatsapp_circuit_breaker (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id uuid REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE,
  circuit_name text NOT NULL, -- 'send_message', 'api_call', 'webhook'
  state text DEFAULT 'closed' CHECK (state IN ('closed', 'open', 'half_open')),
  failure_count integer DEFAULT 0,
  success_count integer DEFAULT 0,
  last_failure_at timestamptz,
  last_success_at timestamptz,
  opened_at timestamptz,
  half_open_at timestamptz,
  threshold_failures integer DEFAULT 5,
  reset_timeout_seconds integer DEFAULT 60,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(instance_id, circuit_name)
);

-- 6. Melhorar fila de envio com retry exponencial
ALTER TABLE public.whatsapp_send_queue 
ADD COLUMN IF NOT EXISTS retry_delay_seconds integer DEFAULT 5,
ADD COLUMN IF NOT EXISTS backoff_multiplier numeric DEFAULT 2,
ADD COLUMN IF NOT EXISTS last_error_code text,
ADD COLUMN IF NOT EXISTS validation_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS phone_validated boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS scheduled_for timestamptz,
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- 7. Criar tabela de validação de números
CREATE TABLE IF NOT EXISTS public.whatsapp_phone_validation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  country_code text,
  is_valid boolean,
  is_whatsapp boolean,
  validation_source text, -- 'api', 'manual', 'history'
  last_checked_at timestamptz,
  check_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(phone_number)
);

-- 8. Criar tabela de logs de estabilidade
CREATE TABLE IF NOT EXISTS public.whatsapp_stability_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id uuid REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE,
  event_type text NOT NULL, -- 'heartbeat_miss', 'circuit_open', 'retry_exhausted', 'connection_lost'
  severity text DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warn', 'error', 'critical')),
  message text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 9. Índices para performance
CREATE INDEX IF NOT EXISTS idx_flow_nodes_rule ON public.whatsapp_flow_nodes(rule_id);
CREATE INDEX IF NOT EXISTS idx_flow_edges_rule ON public.whatsapp_flow_edges(rule_id);
CREATE INDEX IF NOT EXISTS idx_circuit_breaker_state ON public.whatsapp_circuit_breaker(state);
CREATE INDEX IF NOT EXISTS idx_send_queue_status ON public.whatsapp_send_queue(status, next_attempt_at);
CREATE INDEX IF NOT EXISTS idx_stability_logs_instance ON public.whatsapp_stability_logs(instance_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_phone_validation ON public.whatsapp_phone_validation(phone_number);
CREATE INDEX IF NOT EXISTS idx_alerts_unresolved ON public.whatsapp_alerts(instance_id, is_resolved) WHERE is_resolved = false;

-- 10. RLS Policies
ALTER TABLE public.whatsapp_flow_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_flow_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_circuit_breaker ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_phone_validation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_stability_logs ENABLE ROW LEVEL SECURITY;

-- Policies para Owner
CREATE POLICY "Owner full access flow_nodes" ON public.whatsapp_flow_nodes FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));
CREATE POLICY "Owner full access flow_edges" ON public.whatsapp_flow_edges FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));
CREATE POLICY "Owner full access circuit_breaker" ON public.whatsapp_circuit_breaker FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));
CREATE POLICY "Owner full access phone_validation" ON public.whatsapp_phone_validation FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));
CREATE POLICY "Owner full access stability_logs" ON public.whatsapp_stability_logs FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));

-- 11. Trigger para atualizar updated_at no circuit breaker
CREATE OR REPLACE FUNCTION update_circuit_breaker_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_circuit_breaker_updated_at ON public.whatsapp_circuit_breaker;
CREATE TRIGGER update_circuit_breaker_updated_at
  BEFORE UPDATE ON public.whatsapp_circuit_breaker
  FOR EACH ROW EXECUTE FUNCTION update_circuit_breaker_timestamp();

-- 12. Função para gerenciar circuit breaker
CREATE OR REPLACE FUNCTION manage_circuit_breaker(
  p_instance_id uuid,
  p_circuit_name text,
  p_success boolean
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_circuit record;
  v_new_state text;
BEGIN
  -- Buscar ou criar circuit breaker
  INSERT INTO whatsapp_circuit_breaker (instance_id, circuit_name)
  VALUES (p_instance_id, p_circuit_name)
  ON CONFLICT (instance_id, circuit_name) DO NOTHING;
  
  SELECT * INTO v_circuit 
  FROM whatsapp_circuit_breaker 
  WHERE instance_id = p_instance_id AND circuit_name = p_circuit_name;
  
  IF p_success THEN
    -- Sucesso
    IF v_circuit.state = 'half_open' THEN
      v_new_state := 'closed';
      UPDATE whatsapp_circuit_breaker 
      SET state = 'closed', failure_count = 0, success_count = success_count + 1, last_success_at = now()
      WHERE id = v_circuit.id;
    ELSE
      UPDATE whatsapp_circuit_breaker 
      SET success_count = success_count + 1, last_success_at = now()
      WHERE id = v_circuit.id;
      v_new_state := v_circuit.state;
    END IF;
  ELSE
    -- Falha
    UPDATE whatsapp_circuit_breaker 
    SET failure_count = failure_count + 1, last_failure_at = now()
    WHERE id = v_circuit.id;
    
    IF v_circuit.failure_count + 1 >= v_circuit.threshold_failures THEN
      v_new_state := 'open';
      UPDATE whatsapp_circuit_breaker 
      SET state = 'open', opened_at = now()
      WHERE id = v_circuit.id;
      
      -- Log do evento
      INSERT INTO whatsapp_stability_logs (instance_id, event_type, severity, message, details)
      VALUES (p_instance_id, 'circuit_open', 'error', 
        'Circuit breaker aberto para ' || p_circuit_name,
        jsonb_build_object('circuit', p_circuit_name, 'failures', v_circuit.failure_count + 1));
    ELSE
      v_new_state := v_circuit.state;
    END IF;
  END IF;
  
  RETURN v_new_state;
END;
$$;

-- 13. Função para verificar se circuit está aberto
CREATE OR REPLACE FUNCTION is_circuit_open(
  p_instance_id uuid,
  p_circuit_name text
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_circuit record;
BEGIN
  SELECT * INTO v_circuit 
  FROM whatsapp_circuit_breaker 
  WHERE instance_id = p_instance_id AND circuit_name = p_circuit_name;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Se está aberto, verificar se já passou o tempo de reset
  IF v_circuit.state = 'open' THEN
    IF v_circuit.opened_at + (v_circuit.reset_timeout_seconds || ' seconds')::interval < now() THEN
      -- Mover para half_open
      UPDATE whatsapp_circuit_breaker 
      SET state = 'half_open', half_open_at = now()
      WHERE id = v_circuit.id;
      RETURN false; -- Permitir uma tentativa
    END IF;
    RETURN true; -- Ainda aberto
  END IF;
  
  RETURN false;
END;
$$;