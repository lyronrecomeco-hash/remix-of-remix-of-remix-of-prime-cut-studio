-- FASE 1 & 3: Atualizar RPC genesis_orchestrate_status_change para sincronizar espelhos
-- orchestrated_status = fonte de verdade
-- effective_status e status = espelhos sincronizados (nunca usados para decisão)

CREATE OR REPLACE FUNCTION public.genesis_orchestrate_status_change(
  p_instance_id UUID,
  p_new_status TEXT,
  p_source TEXT DEFAULT 'system',
  p_force BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_status TEXT;
  v_allowed_transitions TEXT[][];
  v_is_valid BOOLEAN := FALSE;
  v_result JSONB;
BEGIN
  -- Buscar status atual
  SELECT orchestrated_status INTO v_current_status
  FROM genesis_instances
  WHERE id = p_instance_id;
  
  IF v_current_status IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Instance not found',
      'instance_id', p_instance_id
    );
  END IF;
  
  -- Se já está no status desejado, retornar sucesso sem mudança
  IF v_current_status = p_new_status THEN
    RETURN jsonb_build_object(
      'success', true,
      'changed', false,
      'from', v_current_status,
      'to', p_new_status,
      'reason', 'Already in target status'
    );
  END IF;
  
  -- Matriz de transições permitidas (30 transições válidas)
  v_allowed_transitions := ARRAY[
    -- De idle
    ARRAY['idle', 'connecting'],
    ARRAY['idle', 'error'],
    
    -- De connecting
    ARRAY['connecting', 'qr_pending'],
    ARRAY['connecting', 'connected'],
    ARRAY['connecting', 'error'],
    ARRAY['connecting', 'disconnected'],
    ARRAY['connecting', 'idle'],
    
    -- De qr_pending
    ARRAY['qr_pending', 'connected'],
    ARRAY['qr_pending', 'stabilizing'],
    ARRAY['qr_pending', 'error'],
    ARRAY['qr_pending', 'disconnected'],
    ARRAY['qr_pending', 'idle'],
    ARRAY['qr_pending', 'connecting'],
    
    -- De stabilizing
    ARRAY['stabilizing', 'connected'],
    ARRAY['stabilizing', 'error'],
    ARRAY['stabilizing', 'disconnected'],
    ARRAY['stabilizing', 'qr_pending'],
    
    -- De connected
    ARRAY['connected', 'disconnected'],
    ARRAY['connected', 'error'],
    ARRAY['connected', 'idle'],
    ARRAY['connected', 'connecting'],
    
    -- De disconnected
    ARRAY['disconnected', 'connecting'],
    ARRAY['disconnected', 'idle'],
    ARRAY['disconnected', 'error'],
    ARRAY['disconnected', 'qr_pending'],
    
    -- De error
    ARRAY['error', 'idle'],
    ARRAY['error', 'connecting'],
    ARRAY['error', 'disconnected'],
    ARRAY['error', 'qr_pending'],
    ARRAY['error', 'connected']
  ];
  
  -- Verificar se transição é permitida
  FOR i IN 1..array_length(v_allowed_transitions, 1) LOOP
    IF v_allowed_transitions[i][1] = v_current_status AND v_allowed_transitions[i][2] = p_new_status THEN
      v_is_valid := TRUE;
      EXIT;
    END IF;
  END LOOP;
  
  -- Se força ou transição válida, executar
  IF p_force OR v_is_valid THEN
    -- CRÍTICO: Atualizar orchestrated_status E os espelhos sincronizados
    UPDATE genesis_instances
    SET 
      orchestrated_status = p_new_status,
      effective_status = p_new_status,  -- ESPELHO SINCRONIZADO
      status = p_new_status,             -- ESPELHO SINCRONIZADO
      status_source = p_source,
      updated_at = now()
    WHERE id = p_instance_id;
    
    -- Registrar evento de transição
    INSERT INTO genesis_status_events (
      instance_id,
      from_status,
      to_status,
      source,
      forced
    ) VALUES (
      p_instance_id,
      v_current_status,
      p_new_status,
      p_source,
      p_force AND NOT v_is_valid
    );
    
    v_result := jsonb_build_object(
      'success', true,
      'changed', true,
      'from', v_current_status,
      'to', p_new_status,
      'source', p_source,
      'forced', p_force AND NOT v_is_valid
    );
  ELSE
    v_result := jsonb_build_object(
      'success', false,
      'changed', false,
      'error', 'Invalid transition',
      'from', v_current_status,
      'to', p_new_status,
      'allowed_from_current', (
        SELECT array_agg(t[2])
        FROM unnest(v_allowed_transitions) AS t
        WHERE t[1] = v_current_status
      )
    );
  END IF;
  
  RETURN v_result;
END;
$$;

-- FASE 4: Limpar estados inconsistentes existentes
UPDATE genesis_instances 
SET 
  effective_status = orchestrated_status,
  status = orchestrated_status
WHERE orchestrated_status IS NOT NULL 
  AND (orchestrated_status != effective_status OR orchestrated_status != status);