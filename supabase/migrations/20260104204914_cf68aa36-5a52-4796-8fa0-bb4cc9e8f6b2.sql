-- Corrigir search_path em todas as funções criadas nas Fases 1-6

CREATE OR REPLACE FUNCTION genesis_block_direct_status_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.orchestrated_status IS DISTINCT FROM NEW.orchestrated_status THEN
    IF current_setting('genesis.authorized_caller', true) IS NULL OR 
       current_setting('genesis.authorized_caller', true) != 'orchestrator' THEN
      RAISE EXCEPTION 'Direct update to orchestrated_status is forbidden. Use genesis_orchestrate_status_change function.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION genesis_validate_state_transition(
  p_from_state TEXT,
  p_to_state TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.genesis_instance_state_transitions
    WHERE from_state = p_from_state AND to_state = p_to_state
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION genesis_block_event_update()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'UPDATE on genesis_instance_events is forbidden. Events are immutable.';
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION genesis_block_event_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'DELETE on genesis_instance_events is forbidden. Events are immutable.';
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION genesis_log_event(
  p_instance_id UUID,
  p_event_type TEXT,
  p_payload JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO public.genesis_instance_events (instance_id, event_type, payload)
  VALUES (p_instance_id, p_event_type, p_payload)
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION genesis_revoke_instance_tokens(p_instance_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.genesis_instance_tokens 
  SET revoked = TRUE 
  WHERE instance_id = p_instance_id AND revoked = FALSE;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
  SELECT orchestrated_status INTO v_current_status
  FROM public.genesis_instances
  WHERE id = p_instance_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Instance not found');
  END IF;
  
  IF v_current_status = p_new_status THEN
    RETURN jsonb_build_object('success', true, 'changed', false, 'status', p_new_status);
  END IF;
  
  SELECT public.genesis_validate_state_transition(v_current_status, p_new_status) INTO v_is_valid;
  
  IF NOT v_is_valid THEN
    PERFORM public.genesis_log_event(
      p_instance_id, 
      'invalid_transition_attempt',
      jsonb_build_object('from', v_current_status, 'to', p_new_status, 'source', p_source)
    );
    
    RETURN jsonb_build_object(
      'success', false, 
      'error', format('Invalid transition from %s to %s', v_current_status, p_new_status)
    );
  END IF;
  
  PERFORM set_config('genesis.authorized_caller', 'orchestrator', true);
  
  UPDATE public.genesis_instances 
  SET 
    orchestrated_status = p_new_status,
    status_source = p_source,
    updated_at = now()
  WHERE id = p_instance_id;
  
  PERFORM set_config('genesis.authorized_caller', '', true);
  
  SELECT public.genesis_log_event(
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;