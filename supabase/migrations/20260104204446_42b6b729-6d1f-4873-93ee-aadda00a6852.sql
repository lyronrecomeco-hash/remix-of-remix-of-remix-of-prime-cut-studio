-- ============================================
-- FASE 1: AUTORIDADE CENTRAL
-- ============================================

-- Adicionar coluna orchestrated_status (fonte única de verdade)
ALTER TABLE genesis_instances 
ADD COLUMN IF NOT EXISTS orchestrated_status TEXT NOT NULL DEFAULT 'idle';

-- Adicionar coluna status_source (rastreabilidade)
ALTER TABLE genesis_instances 
ADD COLUMN IF NOT EXISTS status_source TEXT NOT NULL DEFAULT 'orchestrator';

-- Constraint para valores válidos de orchestrated_status
DO $$ BEGIN
  ALTER TABLE genesis_instances 
    ADD CONSTRAINT orchestrated_status_check 
    CHECK (orchestrated_status IN (
      'idle','connecting','qr_pending','stabilizing',
      'connected','disconnected','error'
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Índice para consultas por status
CREATE INDEX IF NOT EXISTS idx_genesis_instances_orchestrated_status 
ON genesis_instances (orchestrated_status);

-- Função para BLOQUEAR escrita direta em orchestrated_status
CREATE OR REPLACE FUNCTION genesis_block_direct_status_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Se está tentando alterar orchestrated_status diretamente
  IF OLD.orchestrated_status IS DISTINCT FROM NEW.orchestrated_status THEN
    -- Verificar se a chamada vem de função autorizada
    IF current_setting('genesis.authorized_caller', true) IS NULL OR 
       current_setting('genesis.authorized_caller', true) != 'orchestrator' THEN
      RAISE EXCEPTION 'Direct update to orchestrated_status is forbidden. Use genesis_orchestrate_status_change function.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para bloquear escrita direta
DROP TRIGGER IF EXISTS trg_block_direct_status_update ON genesis_instances;
CREATE TRIGGER trg_block_direct_status_update
  BEFORE UPDATE ON genesis_instances
  FOR EACH ROW
  EXECUTE FUNCTION genesis_block_direct_status_update();

-- ============================================
-- FASE 2: STATE MACHINE
-- ============================================

-- Tabela de transições válidas
CREATE TABLE IF NOT EXISTS genesis_instance_state_transitions (
  from_state TEXT NOT NULL,
  to_state TEXT NOT NULL,
  PRIMARY KEY (from_state, to_state)
);

-- Inserir transições válidas (idempotente)
INSERT INTO genesis_instance_state_transitions (from_state, to_state) VALUES
  ('idle', 'connecting'),
  ('connecting', 'qr_pending'),
  ('connecting', 'error'),
  ('qr_pending', 'stabilizing'),
  ('qr_pending', 'error'),
  ('stabilizing', 'connected'),
  ('stabilizing', 'error'),
  ('connected', 'disconnected'),
  ('connected', 'error'),
  ('error', 'connecting'),
  ('disconnected', 'connecting')
ON CONFLICT DO NOTHING;

-- Função para validar transição
CREATE OR REPLACE FUNCTION genesis_validate_state_transition(
  p_from_state TEXT,
  p_to_state TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM genesis_instance_state_transitions
    WHERE from_state = p_from_state AND to_state = p_to_state
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FASE 3: EVENTOS IMUTÁVEIS
-- ============================================

-- Tabela de eventos (log imutável)
CREATE TABLE IF NOT EXISTS genesis_instance_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES genesis_instances(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para consultas
CREATE INDEX IF NOT EXISTS idx_instance_events_instance_time 
ON genesis_instance_events (instance_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_instance_events_type 
ON genesis_instance_events (event_type);

-- Função para BLOQUEAR UPDATE em eventos
CREATE OR REPLACE FUNCTION genesis_block_event_update()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'UPDATE on genesis_instance_events is forbidden. Events are immutable.';
END;
$$ LANGUAGE plpgsql;

-- Função para BLOQUEAR DELETE em eventos
CREATE OR REPLACE FUNCTION genesis_block_event_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'DELETE on genesis_instance_events is forbidden. Events are immutable.';
END;
$$ LANGUAGE plpgsql;

-- Triggers para imutabilidade
DROP TRIGGER IF EXISTS trg_block_event_update ON genesis_instance_events;
CREATE TRIGGER trg_block_event_update
  BEFORE UPDATE ON genesis_instance_events
  FOR EACH ROW
  EXECUTE FUNCTION genesis_block_event_update();

DROP TRIGGER IF EXISTS trg_block_event_delete ON genesis_instance_events;
CREATE TRIGGER trg_block_event_delete
  BEFORE DELETE ON genesis_instance_events
  FOR EACH ROW
  EXECUTE FUNCTION genesis_block_event_delete();

-- Função helper para registrar eventos
CREATE OR REPLACE FUNCTION genesis_log_event(
  p_instance_id UUID,
  p_event_type TEXT,
  p_payload JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO genesis_instance_events (instance_id, event_type, payload)
  VALUES (p_instance_id, p_event_type, p_payload)
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FASE 4: AUTENTICAÇÃO REAL (JWT)
-- ============================================

-- Tabela de tokens JWT por instância
CREATE TABLE IF NOT EXISTS genesis_instance_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES genesis_instances(id) ON DELETE CASCADE,
  jwt_id TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para tokens válidos
CREATE INDEX IF NOT EXISTS idx_tokens_instance_valid 
ON genesis_instance_tokens (instance_id, expires_at) 
WHERE revoked = FALSE;

-- Função para revogar todos tokens de uma instância
CREATE OR REPLACE FUNCTION genesis_revoke_instance_tokens(p_instance_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE genesis_instance_tokens 
  SET revoked = TRUE 
  WHERE instance_id = p_instance_id AND revoked = FALSE;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FASE 5: PUSH EM TEMPO REAL (Webhook Sources)
-- ============================================

-- Tabela de fontes de webhook autorizadas
CREATE TABLE IF NOT EXISTS genesis_webhook_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL CHECK (source_type IN ('vps')),
  source_identifier TEXT NOT NULL,
  secret_hash TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice único para fonte
CREATE UNIQUE INDEX IF NOT EXISTS idx_webhook_sources_identifier 
ON genesis_webhook_sources (source_type, source_identifier) 
WHERE active = TRUE;

-- ============================================
-- FASE 6: HEALTH CHECK ATIVO
-- ============================================

-- Adicionar colunas de health
ALTER TABLE genesis_instances 
ADD COLUMN IF NOT EXISTS last_health_ping TIMESTAMPTZ;

ALTER TABLE genesis_instances 
ADD COLUMN IF NOT EXISTS health_status TEXT NOT NULL DEFAULT 'unknown';

-- Constraint para valores válidos de health_status
DO $$ BEGIN
  ALTER TABLE genesis_instances 
    ADD CONSTRAINT health_status_check 
    CHECK (health_status IN ('healthy','degraded','dead','unknown'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Índice para consultas de saúde
CREATE INDEX IF NOT EXISTS idx_instances_health 
ON genesis_instances (health_status, last_health_ping);

-- ============================================
-- FUNÇÃO CENTRAL: ORQUESTRADOR DE STATUS
-- ============================================

CREATE OR REPLACE FUNCTION genesis_orchestrate_status_change(
  p_instance_id UUID,
  p_new_status TEXT,
  p_source TEXT DEFAULT 'orchestrator',
  p_payload JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB AS $$
DECLARE
  v_current_status TEXT;
  v_is_valid BOOLEAN;
  v_event_id UUID;
BEGIN
  -- Buscar status atual
  SELECT orchestrated_status INTO v_current_status
  FROM genesis_instances
  WHERE id = p_instance_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Instance not found');
  END IF;
  
  -- Se status é o mesmo, não fazer nada
  IF v_current_status = p_new_status THEN
    RETURN jsonb_build_object('success', true, 'changed', false, 'status', p_new_status);
  END IF;
  
  -- Validar transição
  SELECT genesis_validate_state_transition(v_current_status, p_new_status) INTO v_is_valid;
  
  IF NOT v_is_valid THEN
    -- Registrar tentativa inválida
    PERFORM genesis_log_event(
      p_instance_id, 
      'invalid_transition_attempt',
      jsonb_build_object('from', v_current_status, 'to', p_new_status, 'source', p_source)
    );
    
    RETURN jsonb_build_object(
      'success', false, 
      'error', format('Invalid transition from %s to %s', v_current_status, p_new_status)
    );
  END IF;
  
  -- Autorizar a mudança via session variable
  PERFORM set_config('genesis.authorized_caller', 'orchestrator', true);
  
  -- Atualizar status
  UPDATE genesis_instances 
  SET 
    orchestrated_status = p_new_status,
    status_source = p_source,
    updated_at = now()
  WHERE id = p_instance_id;
  
  -- Limpar autorização
  PERFORM set_config('genesis.authorized_caller', '', true);
  
  -- Registrar evento
  SELECT genesis_log_event(
    p_instance_id,
    'status_changed',
    jsonb_build_object(
      'from', v_current_status, 
      'to', p_new_status, 
      'source', p_source,
      'payload', p_payload
    )
  ) INTO v_event_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'changed', true,
    'from', v_current_status,
    'to', p_new_status,
    'event_id', v_event_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Habilitar RLS nas novas tabelas
ALTER TABLE genesis_instance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE genesis_instance_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE genesis_instance_state_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE genesis_webhook_sources ENABLE ROW LEVEL SECURITY;

-- Policies para genesis_instance_events
DROP POLICY IF EXISTS "Users can view their instance events" ON genesis_instance_events;
CREATE POLICY "Users can view their instance events" 
ON genesis_instance_events FOR SELECT
USING (
  instance_id IN (
    SELECT id FROM genesis_instances WHERE user_id = auth.uid()
  )
);

-- Policies para genesis_instance_tokens
DROP POLICY IF EXISTS "Users can view their instance tokens" ON genesis_instance_tokens;
CREATE POLICY "Users can view their instance tokens" 
ON genesis_instance_tokens FOR SELECT
USING (
  instance_id IN (
    SELECT id FROM genesis_instances WHERE user_id = auth.uid()
  )
);

-- Policies para state_transitions (leitura pública)
DROP POLICY IF EXISTS "Anyone can read state transitions" ON genesis_instance_state_transitions;
CREATE POLICY "Anyone can read state transitions" 
ON genesis_instance_state_transitions FOR SELECT
USING (true);

-- Policies para webhook_sources (apenas service role pode ver)
DROP POLICY IF EXISTS "Service role only for webhook sources" ON genesis_webhook_sources;
CREATE POLICY "Service role only for webhook sources" 
ON genesis_webhook_sources FOR ALL
USING (false)
WITH CHECK (false);