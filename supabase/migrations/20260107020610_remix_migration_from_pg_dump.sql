CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: affiliate_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.affiliate_status AS ENUM (
    'pending',
    'active',
    'blocked'
);


--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'super_admin',
    'admin',
    'barber'
);


--
-- Name: crm_lead_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.crm_lead_status AS ENUM (
    'new',
    'active',
    'won',
    'lost'
);


--
-- Name: crm_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.crm_role AS ENUM (
    'admin',
    'manager',
    'collaborator'
);


--
-- Name: crm_task_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.crm_task_status AS ENUM (
    'pending',
    'in_progress',
    'completed',
    'cancelled'
);


--
-- Name: crm_task_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.crm_task_type AS ENUM (
    'call',
    'meeting',
    'followup',
    'internal'
);


--
-- Name: flow_lifecycle_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.flow_lifecycle_status AS ENUM (
    'draft',
    'validated',
    'active',
    'paused',
    'error'
);


--
-- Name: genesis_plan; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.genesis_plan AS ENUM (
    'free',
    'starter',
    'professional',
    'enterprise'
);


--
-- Name: genesis_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.genesis_role AS ENUM (
    'super_admin',
    'admin',
    'user'
);


--
-- Name: pix_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.pix_type AS ENUM (
    'cpf',
    'cnpj',
    'email',
    'phone',
    'random'
);


--
-- Name: proposal_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.proposal_status AS ENUM (
    'draft',
    'sent',
    'accepted',
    'cancelled'
);


--
-- Name: referral_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.referral_status AS ENUM (
    'pending',
    'confirmed',
    'cancelled',
    'paid'
);


--
-- Name: withdrawal_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.withdrawal_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'rejected'
);


--
-- Name: auto_provision_tenant(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_provision_tenant() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_tenant uuid;
BEGIN
  SELECT tenant_id
  INTO v_tenant
  FROM public.user_tenants
  WHERE user_id = NEW.id;

  IF v_tenant IS NULL THEN
    INSERT INTO public.tenants DEFAULT VALUES
    RETURNING id INTO v_tenant;

    INSERT INTO public.user_tenants (user_id, tenant_id, role)
    VALUES (NEW.id, v_tenant, 'owner');
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: calculate_proposal_commission(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_proposal_commission() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Quando status muda para 'accepted', calcular comissão
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    -- Buscar taxa de comissão do afiliado ou usar default
    SELECT COALESCE(commission_rate_monthly, 30) INTO NEW.commission_rate
    FROM public.affiliates 
    WHERE id = NEW.affiliate_id;
    
    -- Calcular valor da comissão
    NEW.commission_amount := (NEW.proposal_value * NEW.commission_rate) / 100;
    NEW.accepted_at := NOW();
    
    -- Atualizar saldo pendente do afiliado
    UPDATE public.affiliates
    SET pending_balance = pending_balance + NEW.commission_amount,
        total_earnings = total_earnings + NEW.commission_amount,
        updated_at = NOW()
    WHERE id = NEW.affiliate_id;
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: check_ip_fraud(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_ip_fraud(check_ip text) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.fraud_protection
    WHERE ip_address = check_ip
      AND attempt_type = 'registration'
      AND is_blocked = false
      AND created_at > now() - interval '24 hours'
  )
$$;


--
-- Name: cleanup_expired_verification_codes(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_expired_verification_codes() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  DELETE FROM public.affiliate_verification_codes
  WHERE expires_at < now() - interval '1 hour';
END;
$$;


--
-- Name: cleanup_queue_on_appointment_done(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_queue_on_appointment_done() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF NEW.status IN ('completed', 'cancelled') THEN
    DELETE FROM public.queue
    WHERE appointment_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: crm_update_timestamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.crm_update_timestamp() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: current_tenant_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.current_tenant_id() RETURNS uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT tenant_id
  FROM public.user_tenants
  WHERE user_id = auth.uid()
$$;


--
-- Name: current_tenant_ids(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.current_tenant_ids() RETURNS SETOF uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT tenant_id
  FROM public.user_tenants
  WHERE user_id = auth.uid();
$$;


--
-- Name: deduct_genesis_credits(uuid, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.deduct_genesis_credits(p_user_id uuid, p_amount integer) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_current_balance INTEGER;
BEGIN
    -- Buscar saldo atual
    SELECT balance INTO v_current_balance
    FROM genesis_credits
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar se tem saldo suficiente
    IF v_current_balance < p_amount THEN
        RETURN FALSE;
    END IF;
    
    -- Deduzir créditos
    UPDATE genesis_credits
    SET balance = balance - p_amount,
        updated_at = now()
    WHERE user_id = p_user_id;
    
    -- Registrar transação
    INSERT INTO genesis_credit_transactions (user_id, amount, type, description)
    VALUES (p_user_id, -p_amount, 'debit', 'Consumo automático de créditos');
    
    RETURN TRUE;
END;
$$;


--
-- Name: genesis_block_direct_status_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.genesis_block_direct_status_update() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF OLD.orchestrated_status IS DISTINCT FROM NEW.orchestrated_status THEN
    IF current_setting('genesis.authorized_caller', true) IS NULL OR 
       current_setting('genesis.authorized_caller', true) != 'orchestrator' THEN
      RAISE EXCEPTION 'Direct update to orchestrated_status is forbidden. Use genesis_orchestrate_status_change function.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: genesis_block_event_delete(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.genesis_block_event_delete() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  RAISE EXCEPTION 'DELETE on genesis_instance_events is forbidden. Events are immutable.';
END;
$$;


--
-- Name: genesis_block_event_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.genesis_block_event_update() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  RAISE EXCEPTION 'UPDATE on genesis_instance_events is forbidden. Events are immutable.';
END;
$$;


--
-- Name: genesis_calculate_health_score(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.genesis_calculate_health_score(p_instance_id uuid) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: genesis_check_webhook_dedup(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.genesis_check_webhook_dedup(p_webhook_config_id uuid, p_event_id text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_config RECORD;
  v_exists BOOLEAN;
BEGIN
  SELECT * INTO v_config FROM genesis_webhook_configs WHERE id = p_webhook_config_id;
  IF NOT FOUND OR NOT v_config.dedup_enabled THEN RETURN true; END IF;
  
  SELECT EXISTS(
    SELECT 1 FROM genesis_webhook_events
    WHERE webhook_config_id = p_webhook_config_id AND event_id = p_event_id
      AND received_at > now() - (v_config.dedup_window_seconds || ' seconds')::interval
  ) INTO v_exists;
  
  RETURN NOT v_exists;
END;
$$;


--
-- Name: genesis_check_webhook_rate_limit(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.genesis_check_webhook_rate_limit(p_webhook_config_id uuid, p_source_ip text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_config RECORD;
  v_rate_limit RECORD;
  v_now TIMESTAMPTZ := now();
  v_allowed BOOLEAN := true;
  v_reason TEXT := null;
BEGIN
  SELECT * INTO v_config FROM genesis_webhook_configs WHERE id = p_webhook_config_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'webhook_not_found');
  END IF;
  
  SELECT * INTO v_rate_limit FROM genesis_webhook_rate_limits 
  WHERE webhook_config_id = p_webhook_config_id AND (source_ip = p_source_ip OR source_ip IS NULL)
  ORDER BY source_ip DESC NULLS LAST LIMIT 1;
  
  IF NOT FOUND THEN
    INSERT INTO genesis_webhook_rate_limits (webhook_config_id, source_ip)
    VALUES (p_webhook_config_id, p_source_ip) RETURNING * INTO v_rate_limit;
  END IF;
  
  IF v_rate_limit.is_blocked AND v_rate_limit.blocked_until > v_now THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'blocked', 'blocked_until', v_rate_limit.blocked_until);
  END IF;
  
  IF v_rate_limit.minute_window_start + interval '1 minute' < v_now THEN
    UPDATE genesis_webhook_rate_limits SET requests_minute = 0, minute_window_start = v_now WHERE id = v_rate_limit.id;
    v_rate_limit.requests_minute := 0;
  END IF;
  
  IF v_rate_limit.hour_window_start + interval '1 hour' < v_now THEN
    UPDATE genesis_webhook_rate_limits SET requests_hour = 0, hour_window_start = v_now WHERE id = v_rate_limit.id;
    v_rate_limit.requests_hour := 0;
  END IF;
  
  IF v_rate_limit.requests_minute >= v_config.rate_limit_per_minute THEN
    v_allowed := false; v_reason := 'rate_limit_minute';
  ELSIF v_rate_limit.requests_hour >= v_config.rate_limit_per_hour THEN
    v_allowed := false; v_reason := 'rate_limit_hour';
  END IF;
  
  IF v_allowed THEN
    UPDATE genesis_webhook_rate_limits SET requests_minute = requests_minute + 1, requests_hour = requests_hour + 1, updated_at = v_now WHERE id = v_rate_limit.id;
  END IF;
  
  RETURN jsonb_build_object('allowed', v_allowed, 'reason', v_reason, 'requests_minute', v_rate_limit.requests_minute + 1, 'requests_hour', v_rate_limit.requests_hour + 1);
END;
$$;


--
-- Name: genesis_cleanup_old_backups(uuid, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.genesis_cleanup_old_backups(p_instance_id uuid, p_keep_count integer DEFAULT 5) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_deleted INTEGER;
BEGIN
    WITH ranked_backups AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY version DESC) as rn
        FROM public.genesis_session_backups
        WHERE instance_id = p_instance_id AND is_valid = true
    )
    UPDATE public.genesis_session_backups
    SET is_valid = false
    WHERE id IN (
        SELECT id FROM ranked_backups WHERE rn > p_keep_count
    );
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$$;


--
-- Name: genesis_complete_failover(uuid, boolean, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.genesis_complete_failover(p_failover_id uuid, p_success boolean, p_error_message text DEFAULT NULL::text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_failover RECORD;
BEGIN
    -- Buscar failover
    SELECT * INTO v_failover
    FROM public.genesis_instance_failovers
    WHERE id = p_failover_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    IF p_success THEN
        -- Atualizar failover
        UPDATE public.genesis_instance_failovers
        SET status = 'completed', completed_at = now()
        WHERE id = p_failover_id;
        
        -- Atualizar instância com novo nó
        UPDATE public.genesis_instances
        SET 
            vps_node_id = v_failover.target_node_id,
            last_failover_at = now(),
            updated_at = now()
        WHERE id = v_failover.instance_id;
        
        -- Atualizar contadores dos nós
        UPDATE public.genesis_vps_nodes
        SET current_instances = current_instances - 1
        WHERE id = v_failover.source_node_id AND current_instances > 0;
        
        UPDATE public.genesis_vps_nodes
        SET current_instances = current_instances + 1
        WHERE id = v_failover.target_node_id;
        
        -- Log
        PERFORM public.genesis_log_event(
            v_failover.instance_id,
            'failover_completed',
            jsonb_build_object('failover_id', p_failover_id)
        );
    ELSE
        -- Marcar como falha
        UPDATE public.genesis_instance_failovers
        SET status = 'failed', error_message = p_error_message, completed_at = now()
        WHERE id = p_failover_id;
        
        PERFORM public.genesis_log_event(
            v_failover.instance_id,
            'failover_failed',
            jsonb_build_object('failover_id', p_failover_id, 'error', p_error_message)
        );
    END IF;
    
    RETURN TRUE;
END;
$$;


--
-- Name: genesis_create_alert(uuid, uuid, text, text, text, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.genesis_create_alert(p_user_id uuid, p_instance_id uuid, p_alert_type text, p_severity text, p_title text, p_message text, p_metadata jsonb DEFAULT '{}'::jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: genesis_create_backup_record(uuid, text, bigint, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.genesis_create_backup_record(p_instance_id uuid, p_checksum text DEFAULT NULL::text, p_file_size bigint DEFAULT 0, p_backup_type text DEFAULT 'automatic'::text, p_metadata jsonb DEFAULT '{}'::jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_next_version INTEGER;
    v_backup_id UUID;
    v_storage_path TEXT;
BEGIN
    -- Calcular próxima versão
    SELECT COALESCE(MAX(version), 0) + 1 INTO v_next_version
    FROM public.genesis_session_backups
    WHERE instance_id = p_instance_id;
    
    -- Gerar path único
    v_storage_path := p_instance_id::TEXT || '/' || v_next_version::TEXT || '_' || 
                      to_char(now(), 'YYYYMMDD_HH24MISS') || '.zip';
    
    -- Criar registro
    INSERT INTO public.genesis_session_backups (
        instance_id,
        storage_path,
        file_size_bytes,
        checksum,
        backup_type,
        session_metadata,
        version
    ) VALUES (
        p_instance_id,
        v_storage_path,
        p_file_size,
        p_checksum,
        p_backup_type,
        p_metadata,
        v_next_version
    )
    RETURNING id INTO v_backup_id;
    
    -- Log do evento
    PERFORM public.genesis_log_event(
        p_instance_id,
        'session_backup_created',
        jsonb_build_object(
            'backup_id', v_backup_id,
            'version', v_next_version,
            'storage_path', v_storage_path,
            'backup_type', p_backup_type
        )
    );
    
    RETURN v_backup_id;
END;
$$;


--
-- Name: genesis_detect_offline_nodes(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.genesis_detect_offline_nodes() RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_offline_threshold INTERVAL := '2 minutes';
    v_node RECORD;
    v_instance RECORD;
    v_count INTEGER := 0;
BEGIN
    -- Marcar nós como offline se sem heartbeat
    UPDATE public.genesis_vps_nodes
    SET status = 'offline'
    WHERE status = 'online'
      AND last_heartbeat_at < now() - v_offline_threshold;
    
    -- Buscar instâncias em nós offline com failover habilitado
    FOR v_instance IN
        SELECT gi.id, gi.vps_node_id
        FROM public.genesis_instances gi
        JOIN public.genesis_vps_nodes gn ON gi.vps_node_id = gn.id
        WHERE gn.status = 'offline'
          AND gi.failover_enabled = true
          AND gi.orchestrated_status = 'connected'
          AND NOT EXISTS (
              SELECT 1 FROM public.genesis_instance_failovers gf
              WHERE gf.instance_id = gi.id 
                AND gf.status IN ('pending', 'backing_up', 'migrating', 'restoring')
          )
    LOOP
        PERFORM public.genesis_initiate_failover(v_instance.id, 'node_failure');
        v_count := v_count + 1;
    END LOOP;
    
    RETURN v_count;
END;
$$;


--
-- Name: genesis_evaluate_alert_rules(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.genesis_evaluate_alert_rules(p_instance_id uuid) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: genesis_get_latest_backup(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.genesis_get_latest_backup(p_instance_id uuid) RETURNS TABLE(backup_id uuid, storage_path text, checksum text, version integer, created_at timestamp with time zone)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
    SELECT 
        id as backup_id,
        storage_path,
        checksum,
        version,
        created_at
    FROM public.genesis_session_backups
    WHERE instance_id = p_instance_id
      AND is_valid = true
      AND (expires_at IS NULL OR expires_at > now())
    ORDER BY version DESC, created_at DESC
    LIMIT 1
$$;


--
-- Name: genesis_initiate_failover(uuid, text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.genesis_initiate_failover(p_instance_id uuid, p_reason text DEFAULT 'manual'::text, p_target_node_id uuid DEFAULT NULL::uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_source_node_id UUID;
    v_target_node UUID;
    v_failover_id UUID;
    v_preferred_region TEXT;
BEGIN
    -- Buscar instância e nó atual
    SELECT vps_node_id, preferred_region INTO v_source_node_id, v_preferred_region
    FROM public.genesis_instances
    WHERE id = p_instance_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Instance not found');
    END IF;
    
    -- Selecionar nó destino se não especificado
    IF p_target_node_id IS NULL THEN
        SELECT node_id INTO v_target_node
        FROM public.genesis_select_best_node(v_preferred_region, v_source_node_id);
        
        IF v_target_node IS NULL THEN
            RETURN jsonb_build_object('success', false, 'error', 'No available nodes');
        END IF;
    ELSE
        v_target_node := p_target_node_id;
    END IF;
    
    -- Criar registro de failover
    INSERT INTO public.genesis_instance_failovers (
        instance_id,
        source_node_id,
        target_node_id,
        reason,
        status
    ) VALUES (
        p_instance_id,
        v_source_node_id,
        v_target_node,
        p_reason,
        'pending'
    )
    RETURNING id INTO v_failover_id;
    
    -- Log do evento
    PERFORM public.genesis_log_event(
        p_instance_id,
        'failover_initiated',
        jsonb_build_object(
            'failover_id', v_failover_id,
            'source_node_id', v_source_node_id,
            'target_node_id', v_target_node,
            'reason', p_reason
        )
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'failover_id', v_failover_id,
        'target_node_id', v_target_node
    );
END;
$$;


--
-- Name: genesis_log_event(uuid, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.genesis_log_event(p_instance_id uuid, p_event_type text, p_payload jsonb DEFAULT '{}'::jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO public.genesis_instance_events (instance_id, event_type, payload)
  VALUES (p_instance_id, p_event_type, p_payload)
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;


--
-- Name: genesis_mark_backup_restored(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.genesis_mark_backup_restored(p_backup_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_instance_id UUID;
BEGIN
    -- Atualizar registro
    UPDATE public.genesis_session_backups
    SET restored_at = now(),
        restored_by = auth.uid()
    WHERE id = p_backup_id
    RETURNING instance_id INTO v_instance_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Log do evento
    PERFORM public.genesis_log_event(
        v_instance_id,
        'session_backup_restored',
        jsonb_build_object('backup_id', p_backup_id)
    );
    
    RETURN TRUE;
END;
$$;


--
-- Name: genesis_node_heartbeat(uuid, numeric, numeric, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.genesis_node_heartbeat(p_node_id uuid, p_cpu_load numeric DEFAULT 0, p_memory_load numeric DEFAULT 0, p_instance_count integer DEFAULT 0, p_avg_latency integer DEFAULT 0) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_health_score INTEGER;
    v_status TEXT;
BEGIN
    -- Calcular health score (0-100)
    v_health_score := GREATEST(0, LEAST(100,
        100 
        - (p_cpu_load * 0.4)::INTEGER 
        - (p_memory_load * 0.3)::INTEGER 
        - LEAST(30, p_avg_latency / 10)
    ));
    
    -- Determinar status baseado em métricas
    v_status := CASE
        WHEN p_cpu_load > 95 OR p_memory_load > 95 THEN 'draining'
        ELSE 'online'
    END;
    
    -- Atualizar nó
    UPDATE public.genesis_vps_nodes
    SET 
        cpu_load = p_cpu_load,
        memory_load = p_memory_load,
        current_instances = p_instance_count,
        avg_latency_ms = p_avg_latency,
        health_score = v_health_score,
        status = v_status,
        last_heartbeat_at = now(),
        updated_at = now()
    WHERE id = p_node_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'health_score', v_health_score,
        'status', v_status
    );
END;
$$;


--
-- Name: genesis_orchestrate_status_change(uuid, text, text, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.genesis_orchestrate_status_change(p_instance_id uuid, p_new_status text, p_source text DEFAULT 'system'::text, p_force boolean DEFAULT false) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: genesis_orchestrate_status_change(uuid, text, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.genesis_orchestrate_status_change(p_instance_id uuid, p_new_status text, p_source text DEFAULT 'orchestrator'::text, p_payload jsonb DEFAULT '{}'::jsonb) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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
$$;


--
-- Name: genesis_record_metrics(uuid, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.genesis_record_metrics(p_instance_id uuid, p_metrics jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: genesis_revoke_instance_tokens(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.genesis_revoke_instance_tokens(p_instance_id uuid) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.genesis_instance_tokens 
  SET revoked = TRUE 
  WHERE instance_id = p_instance_id AND revoked = FALSE;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;


--
-- Name: genesis_select_best_node(text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.genesis_select_best_node(p_region text DEFAULT NULL::text, p_exclude_node_id uuid DEFAULT NULL::uuid) RETURNS TABLE(node_id uuid, node_name text, node_url text, available_slots integer, health_score integer)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
    SELECT 
        id as node_id,
        name as node_name,
        base_url as node_url,
        (max_instances - current_instances) as available_slots,
        health_score
    FROM public.genesis_vps_nodes
    WHERE is_active = true
      AND status = 'online'
      AND current_instances < max_instances
      AND (p_region IS NULL OR region = p_region)
      AND (p_exclude_node_id IS NULL OR id != p_exclude_node_id)
    ORDER BY 
        health_score DESC,
        (max_instances - current_instances) DESC,
        priority DESC
    LIMIT 1
$$;


--
-- Name: genesis_validate_state_transition(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.genesis_validate_state_transition(p_from_state text, p_to_state text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.genesis_instance_state_transitions
    WHERE from_state = p_from_state AND to_state = p_to_state
  );
END;
$$;


--
-- Name: get_affiliate_id(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_affiliate_id(_user_id uuid) RETURNS uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT id
  FROM public.affiliates
  WHERE user_id = _user_id
  LIMIT 1
$$;


--
-- Name: get_crm_tenant_id(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_crm_tenant_id(_auth_user_id uuid) RETURNS uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT crm_tenant_id
  FROM public.crm_users
  WHERE auth_user_id = _auth_user_id
    AND is_active = true
  LIMIT 1
$$;


--
-- Name: get_crm_user_id(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_crm_user_id(_auth_user_id uuid) RETURNS uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT id
  FROM public.crm_users
  WHERE auth_user_id = _auth_user_id
    AND is_active = true
  LIMIT 1
$$;


--
-- Name: get_genesis_user_id(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_genesis_user_id(_auth_user_id uuid) RETURNS uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
    SELECT id FROM public.genesis_users WHERE auth_user_id = _auth_user_id LIMIT 1
$$;


--
-- Name: get_user_plan(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_plan(check_user_id uuid) RETURNS text
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT sp.name
  FROM public.shop_subscriptions ss
  JOIN public.subscription_plans sp ON ss.plan_id = sp.id
  WHERE ss.user_id = check_user_id
    AND ss.status = 'active'
  LIMIT 1
$$;


--
-- Name: has_genesis_role(uuid, public.genesis_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_genesis_role(_user_id uuid, _role public.genesis_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.genesis_user_roles gr
        JOIN public.genesis_users gu ON gu.id = gr.user_id
        WHERE gu.auth_user_id = _user_id AND gr.role = _role
    )
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: is_admin(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin(_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'super_admin')
  )
$$;


--
-- Name: is_affiliate(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_affiliate(_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.affiliates
    WHERE user_id = _user_id
      AND status = 'active'
  )
$$;


--
-- Name: is_circuit_open(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_circuit_open(p_instance_id uuid, p_circuit_name text) RETURNS boolean
    LANGUAGE plpgsql STABLE SECURITY DEFINER
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


--
-- Name: is_crm_admin(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_crm_admin(_auth_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.crm_users
    WHERE auth_user_id = _auth_user_id
      AND role = 'admin'
      AND is_active = true
  )
$$;


--
-- Name: is_crm_member(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_crm_member(_auth_user_id uuid, _tenant_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.crm_users
    WHERE auth_user_id = _auth_user_id
      AND crm_tenant_id = _tenant_id
      AND is_active = true
  )
$$;


--
-- Name: is_feature_allowed(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_feature_allowed(check_user_id uuid, feature_name text) RETURNS boolean
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  plan_features jsonb;
BEGIN
  SELECT sp.features INTO plan_features
  FROM public.shop_subscriptions ss
  JOIN public.subscription_plans sp ON ss.plan_id = sp.id
  WHERE ss.user_id = check_user_id
    AND ss.status = 'active'
  LIMIT 1;
  
  IF plan_features IS NULL THEN
    RETURN false;
  END IF;
  
  IF plan_features ? 'all' THEN
    RETURN true;
  END IF;
  
  RETURN plan_features ? feature_name;
END;
$$;


--
-- Name: is_genesis_super_admin(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_genesis_super_admin(_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
    SELECT public.has_genesis_role(_user_id, 'super_admin')
$$;


--
-- Name: is_owner(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_owner(_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN auth.users au ON ur.user_id = au.id
    WHERE ur.user_id = _user_id
      AND ur.role = 'super_admin'
      AND au.email = 'lyronrp@gmail.com'
  )
$$;


--
-- Name: log_security_event(text, text, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_security_event(p_action text, p_entity_type text, p_entity_id text DEFAULT NULL::text, p_details jsonb DEFAULT NULL::jsonb) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    details
  ) VALUES (
    auth.uid(),
    p_action,
    p_entity_type,
    p_entity_id,
    COALESCE(p_details, '{}'::jsonb) || jsonb_build_object('timestamp', now())
  );
END;
$$;


--
-- Name: manage_circuit_breaker(uuid, text, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.manage_circuit_breaker(p_instance_id uuid, p_circuit_name text, p_success boolean) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
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


--
-- Name: pay_proposal_commission(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.pay_proposal_commission(proposal_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_affiliate_id uuid;
  v_commission numeric;
BEGIN
  -- Buscar dados da proposta
  SELECT affiliate_id, commission_amount INTO v_affiliate_id, v_commission
  FROM public.affiliate_proposals
  WHERE id = proposal_id 
    AND status = 'accepted' 
    AND commission_paid = false;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Marcar como paga
  UPDATE public.affiliate_proposals
  SET commission_paid = true,
      commission_paid_at = NOW()
  WHERE id = proposal_id;
  
  -- Mover de pendente para disponível
  UPDATE public.affiliates
  SET pending_balance = pending_balance - v_commission,
      available_balance = available_balance + v_commission,
      updated_at = NOW()
  WHERE id = v_affiliate_id;
  
  RETURN true;
END;
$$;


--
-- Name: prevent_queue_status_regression(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.prevent_queue_status_regression() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       AND NEW.status = 'waiting'
       AND OLD.status IN ('called', 'onway') THEN
      RAISE EXCEPTION 'Queue status cannot regress to waiting';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: set_tenant_id_on_insert(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_tenant_id_on_insert() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_tenant uuid;
BEGIN
  IF NEW.tenant_id IS NULL THEN
    SELECT tenant_id
    INTO v_tenant
    FROM public.current_tenant_ids()
    LIMIT 1;
    NEW.tenant_id := v_tenant;
  END IF;
  IF NEW.tenant_id IS NULL THEN
    RAISE EXCEPTION 'tenant_id is required';
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: tenant_matches(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tenant_matches(p_tenant uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT auth.uid() IS NOT NULL
     AND p_tenant IS NOT NULL
     AND p_tenant = public.current_tenant_id()
$$;


--
-- Name: update_circuit_breaker_timestamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_circuit_breaker_timestamp() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_flow_lifecycle_status(uuid, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_flow_lifecycle_status(p_flow_id uuid, p_new_status text, p_validation_result jsonb DEFAULT NULL::jsonb) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_current_status text;
  v_allowed_transitions jsonb;
  v_result jsonb;
BEGIN
  -- Get current status
  SELECT lifecycle_status INTO v_current_status
  FROM public.whatsapp_automation_rules
  WHERE id = p_flow_id;
  
  IF v_current_status IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Flow not found');
  END IF;
  
  -- Define allowed transitions
  v_allowed_transitions := '{
    "draft": ["validated"],
    "validated": ["active", "draft"],
    "active": ["paused", "error"],
    "paused": ["active", "draft"],
    "error": ["draft", "paused"]
  }'::jsonb;
  
  -- Check if transition is allowed
  IF NOT (v_allowed_transitions->v_current_status ? p_new_status) THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', format('Transition from %s to %s not allowed', v_current_status, p_new_status),
      'current_status', v_current_status,
      'requested_status', p_new_status
    );
  END IF;
  
  -- Update status with appropriate timestamps
  UPDATE public.whatsapp_automation_rules
  SET 
    lifecycle_status = p_new_status,
    is_active = (p_new_status = 'active'),
    validated_at = CASE WHEN p_new_status = 'validated' THEN now() ELSE validated_at END,
    validation_result = COALESCE(p_validation_result, validation_result),
    activated_at = CASE WHEN p_new_status = 'active' THEN now() ELSE activated_at END,
    paused_at = CASE WHEN p_new_status = 'paused' THEN now() ELSE paused_at END,
    updated_at = now()
  WHERE id = p_flow_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'previous_status', v_current_status,
    'new_status', p_new_status,
    'transitioned_at', now()
  );
END;
$$;


--
-- Name: update_genesis_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_genesis_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_wa_interactive_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_wa_interactive_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_whatsapp_api_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_whatsapp_api_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: validate_tenant_immutable(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_tenant_immutable() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.tenant_id IS DISTINCT FROM OLD.tenant_id THEN
    RAISE EXCEPTION 'tenant_id is immutable';
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: validate_token_owner(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_token_owner(token_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT token_user_id = auth.uid() OR is_owner(auth.uid())
$$;


SET default_table_access_method = heap;

--
-- Name: admin_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    setting_type text NOT NULL,
    settings jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid,
    tenant_id uuid DEFAULT public.current_tenant_id()
);

ALTER TABLE ONLY public.admin_settings FORCE ROW LEVEL SECURITY;


--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    expires_at timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: affiliate_clicks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.affiliate_clicks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    affiliate_id uuid NOT NULL,
    ip_address text,
    user_agent text,
    referrer text,
    landing_page text,
    clicked_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: affiliate_materials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.affiliate_materials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    type text NOT NULL,
    content text,
    image_url text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT affiliate_materials_type_check CHECK ((type = ANY (ARRAY['banner'::text, 'copy'::text, 'video'::text, 'link'::text])))
);


--
-- Name: affiliate_proposals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.affiliate_proposals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    affiliate_id uuid NOT NULL,
    company_name text NOT NULL,
    company_email text,
    company_phone text,
    company_cnpj text,
    contact_name text,
    status public.proposal_status DEFAULT 'draft'::public.proposal_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    sent_at timestamp with time zone,
    accepted_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    notes text,
    niche_id uuid,
    questionnaire_answers jsonb DEFAULT '[]'::jsonb,
    questionnaire_completed boolean DEFAULT false,
    ai_analysis jsonb,
    generated_proposal jsonb,
    proposal_generated_at timestamp with time zone,
    proposal_value numeric DEFAULT 0,
    commission_rate numeric DEFAULT 30,
    commission_amount numeric DEFAULT 0,
    commission_paid boolean DEFAULT false,
    commission_paid_at timestamp with time zone
);


--
-- Name: affiliate_referrals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.affiliate_referrals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    affiliate_id uuid NOT NULL,
    referred_user_id uuid NOT NULL,
    plan_name text,
    plan_price numeric,
    commission_rate numeric,
    commission_amount numeric,
    status public.referral_status DEFAULT 'pending'::public.referral_status NOT NULL,
    trial_expires_at timestamp with time zone,
    converted_at timestamp with time zone,
    confirmed_at timestamp with time zone,
    paid_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: affiliate_verification_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.affiliate_verification_codes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    password_hash text NOT NULL,
    code text NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:10:00'::interval) NOT NULL,
    verified_at timestamp with time zone,
    attempts integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: affiliate_withdrawals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.affiliate_withdrawals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    affiliate_id uuid NOT NULL,
    amount numeric NOT NULL,
    pix_key text NOT NULL,
    pix_type public.pix_type NOT NULL,
    status public.withdrawal_status DEFAULT 'pending'::public.withdrawal_status NOT NULL,
    rejection_reason text,
    processed_by uuid,
    requested_at timestamp with time zone DEFAULT now() NOT NULL,
    processed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: affiliates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.affiliates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    whatsapp text NOT NULL,
    affiliate_code text NOT NULL,
    password_hash text NOT NULL,
    commission_rate_monthly numeric DEFAULT 30 NOT NULL,
    commission_rate_lifetime numeric DEFAULT 25 NOT NULL,
    pix_key text,
    pix_type public.pix_type,
    status public.affiliate_status DEFAULT 'active'::public.affiliate_status NOT NULL,
    total_earnings numeric DEFAULT 0 NOT NULL,
    available_balance numeric DEFAULT 0 NOT NULL,
    pending_balance numeric DEFAULT 0 NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    protocol text NOT NULL,
    client_name text NOT NULL,
    client_phone text NOT NULL,
    service_id uuid NOT NULL,
    barber_id uuid NOT NULL,
    date date NOT NULL,
    "time" text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid,
    tenant_id uuid DEFAULT public.current_tenant_id(),
    CONSTRAINT appointments_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'inqueue'::text, 'called'::text, 'onway'::text, 'completed'::text, 'cancelled'::text])))
);

ALTER TABLE ONLY public.appointments FORCE ROW LEVEL SECURITY;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id text,
    details jsonb,
    ip_address text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: barber_availability; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.barber_availability (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    barber_id uuid NOT NULL,
    date date NOT NULL,
    available_slots text[] DEFAULT '{}'::text[] NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid,
    tenant_id uuid DEFAULT public.current_tenant_id()
);

ALTER TABLE ONLY public.barber_availability FORCE ROW LEVEL SECURITY;


--
-- Name: barber_leaves; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.barber_leaves (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    barber_id uuid NOT NULL,
    leave_type text DEFAULT 'dayoff'::text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    reason text,
    status text DEFAULT 'pending'::text NOT NULL,
    approved_by uuid,
    approved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid,
    tenant_id uuid DEFAULT public.current_tenant_id(),
    CONSTRAINT valid_date_range CHECK ((end_date >= start_date))
);

ALTER TABLE ONLY public.barber_leaves FORCE ROW LEVEL SECURITY;


--
-- Name: barber_performance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.barber_performance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    barber_id uuid NOT NULL,
    period_type text DEFAULT 'monthly'::text NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    total_appointments integer DEFAULT 0 NOT NULL,
    completed_appointments integer DEFAULT 0 NOT NULL,
    cancelled_appointments integer DEFAULT 0 NOT NULL,
    no_show_appointments integer DEFAULT 0 NOT NULL,
    total_revenue numeric DEFAULT 0 NOT NULL,
    avg_rating numeric,
    new_clients integer DEFAULT 0 NOT NULL,
    returning_clients integer DEFAULT 0 NOT NULL,
    avg_service_time integer,
    most_popular_service_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid,
    tenant_id uuid DEFAULT public.current_tenant_id()
);

ALTER TABLE ONLY public.barber_performance FORCE ROW LEVEL SECURITY;


--
-- Name: barber_schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.barber_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    barber_id uuid NOT NULL,
    day_of_week integer NOT NULL,
    start_time text DEFAULT '09:00'::text NOT NULL,
    end_time text DEFAULT '18:00'::text NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid,
    tenant_id uuid DEFAULT public.current_tenant_id(),
    CONSTRAINT barber_schedules_day_of_week_check CHECK (((day_of_week >= 0) AND (day_of_week <= 6)))
);

ALTER TABLE ONLY public.barber_schedules FORCE ROW LEVEL SECURITY;


--
-- Name: barbers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.barbers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    photo text,
    specialties text[] DEFAULT '{}'::text[],
    experience text,
    rating numeric(2,1) DEFAULT 5.0,
    available boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid,
    tenant_id uuid DEFAULT public.current_tenant_id()
);

ALTER TABLE ONLY public.barbers FORCE ROW LEVEL SECURITY;


--
-- Name: blocked_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blocked_slots (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    barber_id uuid NOT NULL,
    date date NOT NULL,
    start_time text NOT NULL,
    end_time text NOT NULL,
    reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid,
    tenant_id uuid DEFAULT public.current_tenant_id()
);

ALTER TABLE ONLY public.blocked_slots FORCE ROW LEVEL SECURITY;


--
-- Name: business_niches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_niches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    icon text,
    base_questions jsonb DEFAULT '[]'::jsonb NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: chatpro_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chatpro_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    api_token text,
    instance_id text,
    base_endpoint text DEFAULT 'https://v2.chatpro.com.br'::text,
    is_enabled boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid,
    tenant_id uuid DEFAULT public.current_tenant_id()
);

ALTER TABLE ONLY public.chatpro_config FORCE ROW LEVEL SECURITY;


--
-- Name: contact_leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    whatsapp text NOT NULL,
    message text,
    plan_interest text DEFAULT 'premium'::text NOT NULL,
    status text DEFAULT 'new'::text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    contacted_at timestamp with time zone,
    converted_at timestamp with time zone
);


--
-- Name: crm_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    crm_tenant_id uuid NOT NULL,
    user_id uuid,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid,
    details jsonb,
    ip_address text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: crm_collaborator_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_collaborator_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    crm_tenant_id uuid NOT NULL,
    name text NOT NULL,
    whatsapp text NOT NULL,
    access_level text DEFAULT 'full'::text NOT NULL,
    token text NOT NULL,
    is_used boolean DEFAULT false,
    used_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone DEFAULT (now() + '7 days'::interval),
    CONSTRAINT crm_collaborator_tokens_access_level_check CHECK ((access_level = ANY (ARRAY['full'::text, 'whatsapp_only'::text])))
);


--
-- Name: crm_custom_fields; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_custom_fields (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    crm_tenant_id uuid NOT NULL,
    name text NOT NULL,
    field_type text DEFAULT 'text'::text NOT NULL,
    options jsonb,
    is_required boolean DEFAULT false,
    is_active boolean DEFAULT true,
    "position" integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: crm_funnel_stages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_funnel_stages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    crm_tenant_id uuid NOT NULL,
    funnel_id uuid NOT NULL,
    name text NOT NULL,
    color text DEFAULT '#6b7280'::text,
    "position" integer DEFAULT 0,
    is_final boolean DEFAULT false,
    is_won boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: crm_funnels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_funnels (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    crm_tenant_id uuid NOT NULL,
    pipeline_id uuid,
    name text NOT NULL,
    description text,
    color text DEFAULT '#3b82f6'::text,
    "position" integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: crm_lead_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_lead_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    crm_tenant_id uuid NOT NULL,
    lead_id uuid NOT NULL,
    user_id uuid,
    action text NOT NULL,
    old_value jsonb,
    new_value jsonb,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: crm_lead_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_lead_tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lead_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: crm_leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    crm_tenant_id uuid NOT NULL,
    funnel_id uuid,
    stage_id uuid,
    pipeline_id uuid,
    responsible_id uuid,
    name text NOT NULL,
    email text,
    phone text,
    company text,
    origin text,
    value numeric DEFAULT 0,
    status public.crm_lead_status DEFAULT 'new'::public.crm_lead_status,
    loss_reason_id uuid,
    notes text,
    custom_fields jsonb DEFAULT '{}'::jsonb,
    stage_entered_at timestamp with time zone DEFAULT now(),
    won_at timestamp with time zone,
    lost_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: crm_loss_reasons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_loss_reasons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    crm_tenant_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: crm_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    crm_tenant_id uuid NOT NULL,
    user_id uuid,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info'::text,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crm_notifications_type_check CHECK ((type = ANY (ARRAY['info'::text, 'success'::text, 'warning'::text, 'error'::text])))
);


--
-- Name: crm_pipelines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_pipelines (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    crm_tenant_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    is_default boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: crm_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    crm_tenant_id uuid NOT NULL,
    name text NOT NULL,
    color text DEFAULT '#3b82f6'::text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: crm_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    crm_tenant_id uuid NOT NULL,
    lead_id uuid,
    assigned_to uuid,
    created_by uuid,
    title text NOT NULL,
    description text,
    task_type public.crm_task_type DEFAULT 'internal'::public.crm_task_type,
    status public.crm_task_status DEFAULT 'pending'::public.crm_task_status,
    priority integer DEFAULT 2,
    due_date timestamp with time zone,
    completed_at timestamp with time zone,
    reminder_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: crm_tenants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_tenants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    segment text,
    owner_user_id uuid NOT NULL,
    settings jsonb DEFAULT '{}'::jsonb,
    onboarding_completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    logo_url text,
    company_data jsonb DEFAULT '{}'::jsonb
);


--
-- Name: crm_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    auth_user_id uuid NOT NULL,
    crm_tenant_id uuid NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    role public.crm_role DEFAULT 'collaborator'::public.crm_role NOT NULL,
    is_active boolean DEFAULT true,
    permissions jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: email_confirmation_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_confirmation_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    email text NOT NULL,
    token text NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '24:00:00'::interval) NOT NULL,
    confirmed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    phone text
);


--
-- Name: email_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_type text NOT NULL,
    recipient_email text NOT NULL,
    recipient_name text,
    subject text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    error_message text,
    metadata jsonb DEFAULT '{}'::jsonb,
    sent_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: email_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_type text NOT NULL,
    name text NOT NULL,
    subject text NOT NULL,
    html_content text NOT NULL,
    variables jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: email_webhook_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_webhook_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_type text NOT NULL,
    email_id text,
    recipient_email text,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: feedbacks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feedbacks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    rating integer NOT NULL,
    text text NOT NULL,
    avatar_type text DEFAULT 'male'::text NOT NULL,
    avatar_url text,
    status text DEFAULT 'new'::text NOT NULL,
    is_anonymous boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id uuid DEFAULT public.current_tenant_id(),
    CONSTRAINT feedbacks_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);

ALTER TABLE ONLY public.feedbacks FORCE ROW LEVEL SECURITY;


--
-- Name: flow_ai_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flow_ai_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    scope_type text DEFAULT 'project'::text NOT NULL,
    scope_id uuid NOT NULL,
    provider text DEFAULT 'lovable'::text NOT NULL,
    api_key_encrypted text,
    model text DEFAULT 'google/gemini-2.5-flash'::text,
    max_tokens integer DEFAULT 4096,
    temperature numeric(3,2) DEFAULT 0.7,
    fallback_provider text,
    fallback_model text,
    rate_limit_per_minute integer DEFAULT 60,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: flow_execution_context; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flow_execution_context (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    execution_id uuid NOT NULL,
    flow_id uuid NOT NULL,
    context_key text NOT NULL,
    context_value jsonb,
    scope text DEFAULT 'execution'::text,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: flow_execution_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flow_execution_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    flow_id uuid NOT NULL,
    execution_id uuid DEFAULT gen_random_uuid() NOT NULL,
    status text DEFAULT 'running'::text NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    duration_ms integer,
    trigger_type text,
    trigger_data jsonb,
    context_snapshot jsonb DEFAULT '{}'::jsonb,
    node_timeline jsonb DEFAULT '[]'::jsonb,
    error_details jsonb,
    retry_count integer DEFAULT 0,
    parent_execution_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: flow_node_executions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flow_node_executions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    execution_id uuid NOT NULL,
    flow_id uuid NOT NULL,
    node_id text NOT NULL,
    node_type text NOT NULL,
    node_label text,
    status text DEFAULT 'pending'::text NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    duration_ms integer,
    input_data jsonb,
    output_data jsonb,
    error_message text,
    retry_attempt integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: fraud_protection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fraud_protection (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ip_address text NOT NULL,
    fingerprint text,
    user_id uuid,
    email text NOT NULL,
    user_agent text,
    attempt_type text DEFAULT 'registration'::text NOT NULL,
    is_blocked boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: genesis_alert_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genesis_alert_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    instance_id uuid,
    name text NOT NULL,
    description text,
    is_enabled boolean DEFAULT true,
    metric_type text NOT NULL,
    condition_operator text NOT NULL,
    threshold_value numeric NOT NULL,
    evaluation_window_minutes integer DEFAULT 60,
    alert_severity text DEFAULT 'warning'::text NOT NULL,
    cooldown_minutes integer DEFAULT 30,
    notify_email boolean DEFAULT false,
    notify_webhook boolean DEFAULT false,
    webhook_url text,
    last_triggered_at timestamp with time zone,
    trigger_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: genesis_alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genesis_alerts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    instance_id uuid,
    vps_node_id uuid,
    alert_type text NOT NULL,
    severity text DEFAULT 'warning'::text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'active'::text NOT NULL,
    acknowledged_at timestamp with time zone,
    acknowledged_by uuid,
    resolved_at timestamp with time zone,
    resolved_by uuid,
    resolution_note text,
    auto_resolve_after interval,
    auto_resolved boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: genesis_credit_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genesis_credit_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type text NOT NULL,
    amount integer NOT NULL,
    description text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT genesis_credit_transactions_type_check CHECK ((type = ANY (ARRAY['purchase'::text, 'usage'::text, 'bonus'::text, 'refund'::text, 'subscription'::text])))
);


--
-- Name: genesis_credit_usage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genesis_credit_usage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    instance_id uuid,
    credits_used integer DEFAULT 0 NOT NULL,
    usage_type text NOT NULL,
    description text,
    usage_date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: genesis_credits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genesis_credits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    available_credits integer DEFAULT 0 NOT NULL,
    used_credits integer DEFAULT 0 NOT NULL,
    total_purchased integer DEFAULT 0 NOT NULL,
    last_purchase_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: genesis_event_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genesis_event_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instance_id uuid,
    user_id uuid,
    event_type text NOT NULL,
    severity text DEFAULT 'info'::text,
    message text NOT NULL,
    details jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: genesis_instance_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genesis_instance_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instance_id uuid NOT NULL,
    event_type text NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: genesis_instance_failovers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genesis_instance_failovers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instance_id uuid NOT NULL,
    source_node_id uuid,
    target_node_id uuid NOT NULL,
    reason text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    backup_id uuid,
    error_message text,
    started_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT genesis_instance_failovers_reason_check CHECK ((reason = ANY (ARRAY['node_failure'::text, 'load_balance'::text, 'manual'::text, 'maintenance'::text, 'health_degraded'::text]))),
    CONSTRAINT genesis_instance_failovers_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'backing_up'::text, 'migrating'::text, 'restoring'::text, 'completed'::text, 'failed'::text, 'cancelled'::text])))
);


--
-- Name: genesis_instance_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genesis_instance_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instance_id uuid NOT NULL,
    user_id uuid NOT NULL,
    period_start timestamp with time zone NOT NULL,
    period_end timestamp with time zone NOT NULL,
    period_type text DEFAULT 'hourly'::text NOT NULL,
    messages_sent integer DEFAULT 0,
    messages_received integer DEFAULT 0,
    messages_failed integer DEFAULT 0,
    connection_uptime_seconds integer DEFAULT 0,
    disconnection_count integer DEFAULT 0,
    reconnection_count integer DEFAULT 0,
    avg_reconnection_time_ms integer DEFAULT 0,
    avg_response_time_ms integer DEFAULT 0,
    max_response_time_ms integer DEFAULT 0,
    min_response_time_ms integer DEFAULT 0,
    api_calls integer DEFAULT 0,
    webhook_deliveries integer DEFAULT 0,
    webhook_failures integer DEFAULT 0,
    avg_cpu_usage numeric(5,2) DEFAULT 0,
    avg_memory_usage numeric(5,2) DEFAULT 0,
    peak_cpu_usage numeric(5,2) DEFAULT 0,
    peak_memory_usage numeric(5,2) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: genesis_instance_state_transitions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genesis_instance_state_transitions (
    from_state text NOT NULL,
    to_state text NOT NULL
);


--
-- Name: genesis_instance_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genesis_instance_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instance_id uuid NOT NULL,
    jwt_id text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    revoked boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: genesis_instances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genesis_instances (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    phone_number text,
    status text DEFAULT 'disconnected'::text NOT NULL,
    qr_code text,
    session_data jsonb,
    is_paused boolean DEFAULT false NOT NULL,
    last_activity_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    backend_url text,
    backend_token text,
    last_heartbeat timestamp with time zone,
    effective_status text DEFAULT 'disconnected'::text,
    heartbeat_age_seconds integer DEFAULT 0,
    orchestrated_status text DEFAULT 'idle'::text NOT NULL,
    status_source text DEFAULT 'orchestrator'::text NOT NULL,
    last_health_ping timestamp with time zone,
    health_status text DEFAULT 'unknown'::text NOT NULL,
    last_backup_id uuid,
    last_backup_at timestamp with time zone,
    backup_enabled boolean DEFAULT true,
    vps_node_id uuid,
    preferred_region text DEFAULT 'br-south'::text,
    failover_enabled boolean DEFAULT true,
    last_failover_at timestamp with time zone,
    CONSTRAINT health_status_check CHECK ((health_status = ANY (ARRAY['healthy'::text, 'degraded'::text, 'dead'::text, 'unknown'::text]))),
    CONSTRAINT orchestrated_status_check CHECK ((orchestrated_status = ANY (ARRAY['idle'::text, 'connecting'::text, 'qr_pending'::text, 'stabilizing'::text, 'connected'::text, 'disconnected'::text, 'error'::text])))
);


--
-- Name: genesis_realtime_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genesis_realtime_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instance_id uuid NOT NULL,
    current_status text NOT NULL,
    last_message_at timestamp with time zone,
    messages_today integer DEFAULT 0,
    uptime_today_seconds integer DEFAULT 0,
    session_start timestamp with time zone,
    session_messages_sent integer DEFAULT 0,
    session_messages_received integer DEFAULT 0,
    health_score integer DEFAULT 100,
    health_factors jsonb DEFAULT '{}'::jsonb,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: genesis_session_backups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genesis_session_backups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instance_id uuid NOT NULL,
    storage_path text NOT NULL,
    file_size_bytes bigint DEFAULT 0,
    checksum text,
    backup_type text DEFAULT 'automatic'::text,
    session_metadata jsonb DEFAULT '{}'::jsonb,
    version integer DEFAULT 1 NOT NULL,
    is_valid boolean DEFAULT true,
    restored_at timestamp with time zone,
    restored_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '30 days'::interval),
    CONSTRAINT genesis_session_backups_backup_type_check CHECK ((backup_type = ANY (ARRAY['automatic'::text, 'manual'::text, 'pre_disconnect'::text, 'scheduled'::text])))
);


--
-- Name: genesis_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genesis_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    plan public.genesis_plan DEFAULT 'free'::public.genesis_plan NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    max_instances integer DEFAULT 1 NOT NULL,
    max_flows integer DEFAULT 5 NOT NULL,
    features jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: genesis_user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genesis_user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.genesis_role DEFAULT 'user'::public.genesis_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: genesis_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genesis_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    auth_user_id uuid NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    avatar_url text,
    phone text,
    company_name text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    whatsapp_commercial text,
    whatsapp_test text
);


--
-- Name: genesis_vps_nodes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genesis_vps_nodes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    region text DEFAULT 'br-south'::text NOT NULL,
    base_url text NOT NULL,
    max_instances integer DEFAULT 50 NOT NULL,
    current_instances integer DEFAULT 0 NOT NULL,
    cpu_load numeric(5,2) DEFAULT 0,
    memory_load numeric(5,2) DEFAULT 0,
    avg_latency_ms integer DEFAULT 0,
    status text DEFAULT 'offline'::text NOT NULL,
    health_score integer DEFAULT 100,
    is_active boolean DEFAULT true,
    priority integer DEFAULT 0,
    last_heartbeat_at timestamp with time zone,
    last_health_check_at timestamp with time zone,
    api_token text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT genesis_vps_nodes_health_score_check CHECK (((health_score >= 0) AND (health_score <= 100))),
    CONSTRAINT genesis_vps_nodes_status_check CHECK ((status = ANY (ARRAY['online'::text, 'offline'::text, 'draining'::text, 'maintenance'::text])))
);


--
-- Name: genesis_webhook_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genesis_webhook_configs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    flow_id uuid,
    webhook_id text DEFAULT encode(extensions.gen_random_bytes(16), 'hex'::text) NOT NULL,
    name text NOT NULL,
    description text,
    secret_key text,
    auth_type text DEFAULT 'none'::text,
    auth_config jsonb DEFAULT '{}'::jsonb,
    rate_limit_per_minute integer DEFAULT 60,
    rate_limit_per_hour integer DEFAULT 1000,
    burst_limit integer DEFAULT 10,
    dedup_enabled boolean DEFAULT true,
    dedup_window_seconds integer DEFAULT 300,
    dedup_field text DEFAULT 'event_id'::text,
    custom_response_enabled boolean DEFAULT false,
    custom_response jsonb DEFAULT '{"body": {"success": true}, "status": 200}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_triggered_at timestamp with time zone,
    CONSTRAINT genesis_webhook_configs_auth_type_check CHECK ((auth_type = ANY (ARRAY['none'::text, 'token'::text, 'header'::text, 'hmac'::text, 'ip_whitelist'::text, 'basic'::text])))
);


--
-- Name: genesis_webhook_dead_letters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genesis_webhook_dead_letters (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    webhook_event_id uuid NOT NULL,
    webhook_config_id uuid NOT NULL,
    original_payload jsonb NOT NULL,
    original_headers jsonb,
    failure_reason text NOT NULL,
    failure_details jsonb,
    retry_count integer DEFAULT 0,
    max_retries integer DEFAULT 3,
    status text DEFAULT 'pending'::text,
    failed_at timestamp with time zone DEFAULT now(),
    last_retry_at timestamp with time zone,
    resolved_at timestamp with time zone,
    CONSTRAINT genesis_webhook_dead_letters_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'retrying'::text, 'reprocessed'::text, 'abandoned'::text])))
);


--
-- Name: genesis_webhook_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genesis_webhook_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    webhook_config_id uuid NOT NULL,
    event_id text,
    execution_id uuid,
    method text NOT NULL,
    path text,
    headers jsonb DEFAULT '{}'::jsonb,
    query_params jsonb DEFAULT '{}'::jsonb,
    body_raw text,
    body_parsed jsonb,
    content_type text,
    source_ip text,
    user_agent text,
    status text DEFAULT 'received'::text,
    validation_result jsonb,
    error_message text,
    error_details jsonb,
    received_at timestamp with time zone DEFAULT now(),
    processed_at timestamp with time zone,
    completed_at timestamp with time zone,
    CONSTRAINT genesis_webhook_events_status_check CHECK ((status = ANY (ARRAY['received'::text, 'validated'::text, 'queued'::text, 'processing'::text, 'completed'::text, 'failed'::text, 'duplicate'::text, 'rejected'::text])))
);


--
-- Name: genesis_webhook_rate_limits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genesis_webhook_rate_limits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    webhook_config_id uuid NOT NULL,
    source_ip text,
    requests_minute integer DEFAULT 0,
    requests_hour integer DEFAULT 0,
    burst_count integer DEFAULT 0,
    minute_window_start timestamp with time zone DEFAULT now(),
    hour_window_start timestamp with time zone DEFAULT now(),
    burst_window_start timestamp with time zone DEFAULT now(),
    is_blocked boolean DEFAULT false,
    blocked_until timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: genesis_webhook_sources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genesis_webhook_sources (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    source_type text NOT NULL,
    source_identifier text NOT NULL,
    secret_hash text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT genesis_webhook_sources_source_type_check CHECK ((source_type = 'vps'::text))
);


--
-- Name: genesis_webhooks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genesis_webhooks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    name text NOT NULL,
    url text NOT NULL,
    secret_key text,
    events text[] DEFAULT ARRAY['connected'::text, 'disconnected'::text, 'message_received'::text],
    is_active boolean DEFAULT true,
    last_triggered_at timestamp with time zone,
    failure_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: login_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.login_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    ip_address text,
    user_agent text,
    success boolean DEFAULT false NOT NULL,
    attempted_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: marketing_campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marketing_campaigns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    message_template text NOT NULL,
    image_url text,
    button_text text,
    button_url text,
    target_count integer DEFAULT 0 NOT NULL,
    sent_count integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    use_ai boolean DEFAULT false NOT NULL,
    ai_prompt text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    scheduled_at timestamp with time zone,
    completed_at timestamp with time zone,
    user_id uuid,
    tenant_id uuid DEFAULT public.current_tenant_id()
);

ALTER TABLE ONLY public.marketing_campaigns FORCE ROW LEVEL SECURITY;


--
-- Name: marketing_contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marketing_contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    campaign_id uuid,
    phone text NOT NULL,
    name text,
    status text DEFAULT 'pending'::text NOT NULL,
    sent_at timestamp with time zone,
    error_message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid,
    tenant_id uuid DEFAULT public.current_tenant_id()
);

ALTER TABLE ONLY public.marketing_contacts FORCE ROW LEVEL SECURITY;


--
-- Name: marketing_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marketing_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    is_enabled boolean DEFAULT false NOT NULL,
    max_contacts integer DEFAULT 100 NOT NULL,
    delay_between_messages integer DEFAULT 3 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    min_delay_seconds integer DEFAULT 8 NOT NULL,
    max_delay_seconds integer DEFAULT 20 NOT NULL,
    daily_limit integer DEFAULT 50 NOT NULL,
    warmup_enabled boolean DEFAULT true NOT NULL,
    warmup_day integer DEFAULT 1 NOT NULL,
    pause_every_n_messages integer DEFAULT 10 NOT NULL,
    pause_duration_seconds integer DEFAULT 30 NOT NULL,
    allowed_start_hour integer DEFAULT 8 NOT NULL,
    allowed_end_hour integer DEFAULT 20 NOT NULL,
    messages_sent_today integer DEFAULT 0 NOT NULL,
    last_reset_date date DEFAULT CURRENT_DATE,
    consecutive_errors integer DEFAULT 0 NOT NULL,
    max_consecutive_errors integer DEFAULT 3 NOT NULL,
    user_id uuid,
    tenant_id uuid DEFAULT public.current_tenant_id()
);

ALTER TABLE ONLY public.marketing_settings FORCE ROW LEVEL SECURITY;


--
-- Name: message_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_type text NOT NULL,
    title text NOT NULL,
    template text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    chatpro_enabled boolean DEFAULT true,
    button_text text,
    button_url text,
    image_url text,
    user_id uuid,
    tenant_id uuid DEFAULT public.current_tenant_id()
);

ALTER TABLE ONLY public.message_templates FORCE ROW LEVEL SECURITY;


--
-- Name: monthly_goals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.monthly_goals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    barber_id uuid,
    goal_type text DEFAULT 'revenue'::text NOT NULL,
    target_value numeric NOT NULL,
    current_value numeric DEFAULT 0 NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    bonus_amount numeric DEFAULT 0,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid,
    tenant_id uuid DEFAULT public.current_tenant_id()
);

ALTER TABLE ONLY public.monthly_goals FORCE ROW LEVEL SECURITY;


--
-- Name: owner_github_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.owner_github_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    repository_url text NOT NULL,
    branch text DEFAULT 'main'::text NOT NULL,
    github_token_secret_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    project_name text DEFAULT 'whatsapp-backend'::text NOT NULL,
    install_path text DEFAULT '/opt/whatsapp-backend'::text NOT NULL,
    pm2_app_name text DEFAULT 'whatsapp-backend'::text NOT NULL,
    node_version text DEFAULT '20'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT owner_github_config_install_path_check CHECK ((install_path ~ '^/[^ ]+$'::text)),
    CONSTRAINT owner_github_config_pm2_name_check CHECK ((pm2_app_name ~ '^[a-zA-Z0-9._-]+$'::text)),
    CONSTRAINT owner_github_config_repo_url_check CHECK ((repository_url ~* '^https://github\.com/[A-Za-z0-9._-]+/[A-Za-z0-9._-]+(\.git)?$'::text))
);


--
-- Name: owner_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.owner_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    setting_key text NOT NULL,
    setting_value jsonb DEFAULT '{}'::jsonb NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: proposal_questionnaire_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proposal_questionnaire_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    proposal_id uuid NOT NULL,
    question_index integer NOT NULL,
    question text NOT NULL,
    answer text,
    ai_follow_up text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: push_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.push_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    endpoint text NOT NULL,
    p256dh text NOT NULL,
    auth text NOT NULL,
    user_type text DEFAULT 'client'::text NOT NULL,
    client_phone text,
    user_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id uuid DEFAULT public.current_tenant_id()
);

ALTER TABLE ONLY public.push_subscriptions FORCE ROW LEVEL SECURITY;


--
-- Name: queue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.queue (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_id uuid NOT NULL,
    "position" integer NOT NULL,
    estimated_wait integer DEFAULT 25 NOT NULL,
    status text DEFAULT 'waiting'::text NOT NULL,
    called_at timestamp with time zone,
    onway_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid,
    tenant_id uuid DEFAULT public.current_tenant_id(),
    CONSTRAINT queue_status_check CHECK ((status = ANY (ARRAY['waiting'::text, 'called'::text, 'onway'::text, 'attended'::text])))
);

ALTER TABLE ONLY public.queue FORCE ROW LEVEL SECURITY;


--
-- Name: rate_limits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rate_limits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    identifier text NOT NULL,
    endpoint text NOT NULL,
    request_count integer DEFAULT 1,
    window_start timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    duration integer DEFAULT 30 NOT NULL,
    price numeric(10,2) DEFAULT 0 NOT NULL,
    icon text DEFAULT 'Scissors'::text,
    visible boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid,
    tenant_id uuid DEFAULT public.current_tenant_id()
);

ALTER TABLE ONLY public.services FORCE ROW LEVEL SECURITY;


--
-- Name: shop_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shop_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text DEFAULT 'Barber Studio'::text NOT NULL,
    tagline text DEFAULT 'Tradição e Estilo'::text,
    description text,
    address text,
    phone text,
    whatsapp text,
    maps_link text,
    logo text,
    hours_weekdays text DEFAULT '09:00 - 20:00'::text,
    hours_saturday text DEFAULT '09:00 - 18:00'::text,
    hours_sunday text DEFAULT 'Fechado'::text,
    lunch_break_start text DEFAULT '12:00'::text,
    lunch_break_end text DEFAULT '13:00'::text,
    instagram text,
    facebook text,
    queue_enabled boolean DEFAULT true,
    max_queue_size integer DEFAULT 10,
    theme text DEFAULT 'dark'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    overload_alert_enabled boolean DEFAULT false,
    daily_appointment_limit integer DEFAULT 20,
    user_id uuid,
    tenant_id uuid DEFAULT public.current_tenant_id()
);

ALTER TABLE ONLY public.shop_settings FORCE ROW LEVEL SECURITY;


--
-- Name: shop_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shop_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    plan_id uuid NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    starts_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    payment_method text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id uuid DEFAULT public.current_tenant_id()
);

ALTER TABLE ONLY public.shop_subscriptions FORCE ROW LEVEL SECURITY;


--
-- Name: site_analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    page text NOT NULL,
    visits integer DEFAULT 0 NOT NULL,
    unique_visitors integer DEFAULT 0 NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid,
    tenant_id uuid DEFAULT public.current_tenant_id()
);

ALTER TABLE ONLY public.site_analytics FORCE ROW LEVEL SECURITY;


--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscription_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    display_name text NOT NULL,
    price numeric DEFAULT 0 NOT NULL,
    billing_cycle text DEFAULT 'monthly'::text NOT NULL,
    limits jsonb DEFAULT '{}'::jsonb NOT NULL,
    features jsonb DEFAULT '[]'::jsonb NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: system_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    log_type text NOT NULL,
    source text NOT NULL,
    message text NOT NULL,
    details jsonb DEFAULT '{}'::jsonb,
    severity text DEFAULT 'info'::text NOT NULL,
    user_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tenants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.tenants FORCE ROW LEVEL SECURITY;


--
-- Name: usage_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usage_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    appointments_count integer DEFAULT 0 NOT NULL,
    clients_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id uuid DEFAULT public.current_tenant_id()
);

ALTER TABLE ONLY public.usage_metrics FORCE ROW LEVEL SECURITY;


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    avatar_url text,
    avatar_type text DEFAULT 'male'::text,
    first_name text,
    last_name text,
    whatsapp text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id uuid DEFAULT public.current_tenant_id()
);

ALTER TABLE ONLY public.user_profiles FORCE ROW LEVEL SECURITY;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_tenants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_tenants (
    user_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    role text DEFAULT 'owner'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.user_tenants FORCE ROW LEVEL SECURITY;


--
-- Name: webhook_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.webhook_configs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_type text NOT NULL,
    webhook_url text,
    is_active boolean DEFAULT false,
    last_triggered_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid,
    tenant_id uuid DEFAULT public.current_tenant_id()
);

ALTER TABLE ONLY public.webhook_configs FORCE ROW LEVEL SECURITY;


--
-- Name: whatsapp_alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_alerts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instance_id uuid,
    alert_type text NOT NULL,
    severity text DEFAULT 'warning'::text,
    title text NOT NULL,
    message text,
    is_resolved boolean DEFAULT false,
    resolved_at timestamp with time zone,
    acknowledged_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    acknowledged_by uuid,
    auto_resolved boolean DEFAULT false,
    notification_sent boolean DEFAULT false,
    metadata jsonb DEFAULT '{}'::jsonb
);


--
-- Name: whatsapp_api_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_api_keys (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    key_hash text NOT NULL,
    key_prefix text NOT NULL,
    instance_id uuid,
    permissions text[] DEFAULT '{}'::text[],
    rate_limit_per_minute integer DEFAULT 60,
    is_active boolean DEFAULT true,
    last_used_at timestamp with time zone,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: whatsapp_api_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_api_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid,
    endpoint text NOT NULL,
    method text NOT NULL,
    request_body jsonb,
    request_headers jsonb,
    response_status integer,
    response_body jsonb,
    response_time_ms integer,
    ip_address text,
    user_agent text,
    idempotency_key text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: whatsapp_api_projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_api_projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    api_key text DEFAULT ('wac_'::text || encode(extensions.gen_random_bytes(24), 'hex'::text)) NOT NULL,
    api_secret text DEFAULT encode(extensions.gen_random_bytes(32), 'hex'::text) NOT NULL,
    owner_user_id uuid NOT NULL,
    rate_limit_per_minute integer DEFAULT 60 NOT NULL,
    rate_limit_per_hour integer DEFAULT 1000 NOT NULL,
    rate_limit_per_day integer DEFAULT 10000 NOT NULL,
    max_instances integer DEFAULT 3 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    environment text DEFAULT 'production'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: whatsapp_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instance_id uuid,
    action text NOT NULL,
    actor_type text DEFAULT 'system'::text,
    actor_id text,
    target_type text,
    target_id text,
    old_value jsonb,
    new_value jsonb,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: whatsapp_automation_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_automation_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid,
    name text NOT NULL,
    description text,
    trigger_type text NOT NULL,
    trigger_config jsonb DEFAULT '{}'::jsonb NOT NULL,
    conditions jsonb DEFAULT '[]'::jsonb,
    actions jsonb DEFAULT '[]'::jsonb NOT NULL,
    priority integer DEFAULT 5 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    execution_count integer DEFAULT 0 NOT NULL,
    last_executed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    flow_data jsonb DEFAULT '{"edges": [], "nodes": []}'::jsonb,
    flow_version integer DEFAULT 1,
    canvas_position jsonb DEFAULT '{"x": 0, "y": 0, "zoom": 1}'::jsonb,
    instance_id uuid NOT NULL,
    user_id uuid NOT NULL,
    lifecycle_status text DEFAULT 'draft'::text,
    global_config jsonb DEFAULT '{"ai_config": {"provider": "lovable", "max_tokens": 4096, "temperature": 0.7, "fallback_provider": null}, "error_mode": "pause", "default_retries": 3, "max_concurrency": 10, "persist_context": true, "timeout_seconds": 300, "distributed_execution": false}'::jsonb,
    validated_at timestamp with time zone,
    validation_result jsonb DEFAULT '{"valid": false, "errors": [], "warnings": []}'::jsonb,
    activated_at timestamp with time zone,
    paused_at timestamp with time zone
);


--
-- Name: whatsapp_automation_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_automation_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_type text NOT NULL,
    name text NOT NULL,
    message_template text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: whatsapp_automations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_automations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instance_id uuid,
    name text NOT NULL,
    trigger_type text NOT NULL,
    trigger_keywords text[] DEFAULT '{}'::text[],
    trigger_conditions jsonb DEFAULT '{}'::jsonb,
    response_type text DEFAULT 'text'::text,
    response_content text,
    response_buttons jsonb,
    response_list jsonb,
    next_automation_id uuid,
    delay_seconds integer DEFAULT 0,
    is_active boolean DEFAULT true,
    priority integer DEFAULT 5,
    match_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    ai_enabled boolean DEFAULT false,
    ai_model text,
    ai_temperature numeric DEFAULT 0.7,
    ai_max_tokens integer DEFAULT 500,
    ai_system_prompt text,
    working_hours_only boolean DEFAULT false
);


--
-- Name: whatsapp_away_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_away_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instance_id uuid,
    message_text text NOT NULL,
    is_active boolean DEFAULT true,
    send_once_per_contact boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: whatsapp_backend_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_backend_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    backend_url text,
    master_token text,
    is_connected boolean DEFAULT false NOT NULL,
    last_health_check timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: whatsapp_business_hours; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_business_hours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instance_id uuid,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: whatsapp_button_actions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_button_actions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_id uuid,
    button_id text NOT NULL,
    action_type text NOT NULL,
    action_config jsonb DEFAULT '{}'::jsonb,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: whatsapp_button_clicks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_button_clicks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instance_id uuid,
    conversation_state_id uuid,
    phone text NOT NULL,
    template_id uuid,
    button_id text NOT NULL,
    button_text text,
    action_triggered text,
    action_result jsonb,
    processed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: whatsapp_circuit_breaker; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_circuit_breaker (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instance_id uuid,
    circuit_name text NOT NULL,
    state text DEFAULT 'closed'::text,
    failure_count integer DEFAULT 0,
    success_count integer DEFAULT 0,
    last_failure_at timestamp with time zone,
    last_success_at timestamp with time zone,
    opened_at timestamp with time zone,
    half_open_at timestamp with time zone,
    threshold_failures integer DEFAULT 5,
    reset_timeout_seconds integer DEFAULT 60,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT whatsapp_circuit_breaker_state_check CHECK ((state = ANY (ARRAY['closed'::text, 'open'::text, 'half_open'::text])))
);


--
-- Name: whatsapp_contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instance_id uuid,
    phone text NOT NULL,
    name text,
    push_name text,
    profile_picture_url text,
    about text,
    is_business boolean DEFAULT false,
    is_verified boolean DEFAULT false,
    is_blocked boolean DEFAULT false,
    has_whatsapp boolean,
    last_checked_at timestamp with time zone,
    tags text[] DEFAULT '{}'::text[],
    custom_fields jsonb DEFAULT '{}'::jsonb,
    synced_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: whatsapp_conversation_states; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_conversation_states (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instance_id uuid,
    phone text NOT NULL,
    contact_name text,
    current_state text DEFAULT 'idle'::text,
    last_template_id uuid,
    last_button_clicked text,
    context_data jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: whatsapp_conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instance_id uuid,
    phone text NOT NULL,
    contact_name text,
    profile_picture_url text,
    last_message text,
    last_message_at timestamp with time zone,
    unread_count integer DEFAULT 0,
    is_archived boolean DEFAULT false,
    is_pinned boolean DEFAULT false,
    is_muted boolean DEFAULT false,
    is_blocked boolean DEFAULT false,
    tags text[] DEFAULT '{}'::text[],
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: whatsapp_event_queue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_event_queue (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid,
    event_type text NOT NULL,
    event_data jsonb NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    max_attempts integer DEFAULT 3 NOT NULL,
    error_message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    processed_at timestamp with time zone,
    scheduled_for timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: whatsapp_external_webhooks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_external_webhooks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    name text NOT NULL,
    url text NOT NULL,
    events text[] DEFAULT '{}'::text[] NOT NULL,
    secret_key text DEFAULT encode(extensions.gen_random_bytes(16), 'hex'::text),
    headers jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true NOT NULL,
    retry_enabled boolean DEFAULT true NOT NULL,
    max_retries integer DEFAULT 3 NOT NULL,
    retry_delay_seconds integer DEFAULT 30 NOT NULL,
    success_count integer DEFAULT 0 NOT NULL,
    failure_count integer DEFAULT 0 NOT NULL,
    last_triggered_at timestamp with time zone,
    last_status_code integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: whatsapp_flow_edges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_flow_edges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    rule_id uuid,
    edge_id text NOT NULL,
    source_node_id text NOT NULL,
    target_node_id text NOT NULL,
    source_handle text,
    target_handle text,
    edge_label text,
    edge_condition jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: whatsapp_flow_nodes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_flow_nodes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    rule_id uuid,
    node_id text NOT NULL,
    node_type text NOT NULL,
    node_label text,
    node_config jsonb DEFAULT '{}'::jsonb,
    position_x numeric DEFAULT 0,
    position_y numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: whatsapp_group_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_group_participants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_id uuid,
    phone text NOT NULL,
    name text,
    is_admin boolean DEFAULT false,
    is_super_admin boolean DEFAULT false,
    joined_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: whatsapp_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_groups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instance_id uuid,
    group_jid text NOT NULL,
    name text,
    description text,
    owner_jid text,
    picture_url text,
    participant_count integer DEFAULT 0,
    is_admin boolean DEFAULT false,
    is_archived boolean DEFAULT false,
    last_message_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    synced_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: whatsapp_health_checks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_health_checks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instance_id uuid,
    status text NOT NULL,
    latency_ms integer,
    last_message_at timestamp with time zone,
    memory_usage_mb integer,
    connection_state text,
    error_message text,
    checked_at timestamp with time zone DEFAULT now()
);


--
-- Name: whatsapp_inbox; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_inbox (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instance_id uuid,
    message_id text,
    phone_from text NOT NULL,
    phone_to text,
    contact_name text,
    message_type text DEFAULT 'text'::text,
    message_content text,
    media_url text,
    media_mime_type text,
    is_from_me boolean DEFAULT false,
    is_read boolean DEFAULT false,
    is_starred boolean DEFAULT false,
    replied_to_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    received_at timestamp with time zone DEFAULT now(),
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: whatsapp_instances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_instances (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    instance_token text DEFAULT encode(extensions.gen_random_bytes(32), 'hex'::text) NOT NULL,
    status text DEFAULT 'inactive'::text NOT NULL,
    phone_number text,
    last_seen timestamp with time zone,
    auto_reply_enabled boolean DEFAULT false NOT NULL,
    auto_reply_message text,
    message_delay_ms integer DEFAULT 1000 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    heartbeat_interval_ms integer DEFAULT 30000,
    last_heartbeat_at timestamp with time zone,
    uptime_seconds integer DEFAULT 0,
    reconnect_attempts integer DEFAULT 0,
    max_reconnect_attempts integer DEFAULT 5,
    auto_reconnect boolean DEFAULT true,
    session_backup jsonb,
    proxy_url text,
    webhook_url text,
    backend_url text DEFAULT 'http://localhost:3001'::text,
    backend_token text,
    is_active boolean DEFAULT true,
    last_heartbeat timestamp with time zone,
    effective_status text DEFAULT 'disconnected'::text,
    heartbeat_age_seconds integer DEFAULT 0,
    CONSTRAINT whatsapp_instances_status_check CHECK ((status = ANY (ARRAY['inactive'::text, 'awaiting_backend'::text, 'connected'::text, 'disconnected'::text, 'qr_pending'::text])))
);


--
-- Name: whatsapp_interactive_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_interactive_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    template_type text DEFAULT 'text'::text NOT NULL,
    message_content text NOT NULL,
    header_type text,
    header_content text,
    footer_text text,
    buttons jsonb DEFAULT '[]'::jsonb,
    list_sections jsonb DEFAULT '[]'::jsonb,
    button_text text,
    variables jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    category text DEFAULT 'general'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: whatsapp_labels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_labels (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    color text DEFAULT '#3b82f6'::text,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: whatsapp_message_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_message_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instance_id uuid NOT NULL,
    direction text NOT NULL,
    phone_to text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    error_message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT whatsapp_message_logs_direction_check CHECK ((direction = ANY (ARRAY['incoming'::text, 'outgoing'::text]))),
    CONSTRAINT whatsapp_message_logs_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'sent'::text, 'delivered'::text, 'read'::text, 'failed'::text])))
);


--
-- Name: whatsapp_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instance_id uuid,
    metric_date date NOT NULL,
    messages_sent integer DEFAULT 0,
    messages_received integer DEFAULT 0,
    messages_failed integer DEFAULT 0,
    media_sent integer DEFAULT 0,
    media_received integer DEFAULT 0,
    unique_contacts integer DEFAULT 0,
    avg_response_time_seconds integer,
    uptime_seconds integer DEFAULT 0,
    disconnection_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: whatsapp_phone_validation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_phone_validation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    phone_number text NOT NULL,
    country_code text,
    is_valid boolean,
    is_whatsapp boolean,
    validation_source text,
    last_checked_at timestamp with time zone,
    check_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: whatsapp_project_instances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_project_instances (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    instance_id uuid NOT NULL,
    can_send boolean DEFAULT true NOT NULL,
    can_receive boolean DEFAULT true NOT NULL,
    can_manage boolean DEFAULT false NOT NULL,
    linked_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: whatsapp_quick_replies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_quick_replies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instance_id uuid,
    shortcut text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    media_url text,
    usage_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: whatsapp_rate_limits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_rate_limits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    minute_count integer DEFAULT 0 NOT NULL,
    minute_window timestamp with time zone DEFAULT date_trunc('minute'::text, now()) NOT NULL,
    hour_count integer DEFAULT 0 NOT NULL,
    hour_window timestamp with time zone DEFAULT date_trunc('hour'::text, now()) NOT NULL,
    day_count integer DEFAULT 0 NOT NULL,
    day_window date DEFAULT CURRENT_DATE NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: whatsapp_scheduled_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_scheduled_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instance_id uuid,
    phone_to text NOT NULL,
    message_type text DEFAULT 'text'::text,
    message_content text,
    media_url text,
    buttons jsonb,
    list_options jsonb,
    scheduled_at timestamp with time zone NOT NULL,
    status text DEFAULT 'pending'::text,
    sent_at timestamp with time zone,
    error_message text,
    retry_count integer DEFAULT 0,
    max_retries integer DEFAULT 3,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: whatsapp_security_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_security_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instance_id uuid,
    rate_limit_per_minute integer DEFAULT 60,
    rate_limit_per_hour integer DEFAULT 500,
    message_delay_min_ms integer DEFAULT 1000,
    message_delay_max_ms integer DEFAULT 3000,
    typing_simulation boolean DEFAULT true,
    typing_duration_ms integer DEFAULT 2000,
    warmup_enabled boolean DEFAULT false,
    warmup_day integer DEFAULT 1,
    warmup_messages_per_day integer DEFAULT 10,
    ip_whitelist text[] DEFAULT '{}'::text[],
    blocked_keywords text[] DEFAULT '{}'::text[],
    require_2fa boolean DEFAULT false,
    audit_log_enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: whatsapp_send_queue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_send_queue (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instance_id uuid,
    phone_to text NOT NULL,
    message_type text DEFAULT 'text'::text,
    message_content text,
    media_url text,
    media_caption text,
    buttons jsonb,
    list_options jsonb,
    priority integer DEFAULT 5,
    status text DEFAULT 'queued'::text,
    attempts integer DEFAULT 0,
    max_attempts integer DEFAULT 3,
    next_attempt_at timestamp with time zone DEFAULT now(),
    sent_at timestamp with time zone,
    error_message text,
    created_at timestamp with time zone DEFAULT now(),
    retry_delay_seconds integer DEFAULT 5,
    backoff_multiplier numeric DEFAULT 2,
    last_error_code text,
    validation_status text DEFAULT 'pending'::text,
    phone_validated boolean DEFAULT false,
    scheduled_for timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb
);


--
-- Name: whatsapp_stability_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_stability_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instance_id uuid,
    event_type text NOT NULL,
    severity text DEFAULT 'info'::text,
    message text,
    details jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT whatsapp_stability_logs_severity_check CHECK ((severity = ANY (ARRAY['debug'::text, 'info'::text, 'warn'::text, 'error'::text, 'critical'::text])))
);


--
-- Name: whatsapp_template_sends; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_template_sends (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instance_id uuid,
    template_id uuid,
    phone text NOT NULL,
    rendered_content text,
    variables_used jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'pending'::text,
    error_message text,
    sent_at timestamp with time zone,
    delivered_at timestamp with time zone,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: whatsapp_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_type text NOT NULL,
    name text NOT NULL,
    message_template text NOT NULL,
    image_url text,
    button_text text,
    button_url text,
    use_ai boolean DEFAULT false,
    ai_prompt text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: whatsapp_webhook_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_webhook_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    webhook_id uuid,
    event_type text NOT NULL,
    payload jsonb NOT NULL,
    response_status integer,
    response_body text,
    attempt_number integer DEFAULT 1,
    is_success boolean DEFAULT false,
    error_message text,
    latency_ms integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: whatsapp_webhooks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_webhooks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instance_id uuid,
    name text NOT NULL,
    url text NOT NULL,
    events text[] NOT NULL,
    secret_key text,
    headers jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    retry_enabled boolean DEFAULT true,
    retry_count integer DEFAULT 3,
    retry_delay_seconds integer DEFAULT 30,
    last_triggered_at timestamp with time zone,
    last_status_code integer,
    success_count integer DEFAULT 0,
    failure_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: admin_settings admin_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_settings
    ADD CONSTRAINT admin_settings_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_user_id_key UNIQUE (user_id);


--
-- Name: affiliate_clicks affiliate_clicks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_clicks
    ADD CONSTRAINT affiliate_clicks_pkey PRIMARY KEY (id);


--
-- Name: affiliate_materials affiliate_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_materials
    ADD CONSTRAINT affiliate_materials_pkey PRIMARY KEY (id);


--
-- Name: affiliate_proposals affiliate_proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_proposals
    ADD CONSTRAINT affiliate_proposals_pkey PRIMARY KEY (id);


--
-- Name: affiliate_referrals affiliate_referrals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_referrals
    ADD CONSTRAINT affiliate_referrals_pkey PRIMARY KEY (id);


--
-- Name: affiliate_verification_codes affiliate_verification_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_verification_codes
    ADD CONSTRAINT affiliate_verification_codes_pkey PRIMARY KEY (id);


--
-- Name: affiliate_withdrawals affiliate_withdrawals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_withdrawals
    ADD CONSTRAINT affiliate_withdrawals_pkey PRIMARY KEY (id);


--
-- Name: affiliates affiliates_affiliate_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliates
    ADD CONSTRAINT affiliates_affiliate_code_key UNIQUE (affiliate_code);


--
-- Name: affiliates affiliates_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliates
    ADD CONSTRAINT affiliates_email_key UNIQUE (email);


--
-- Name: affiliates affiliates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliates
    ADD CONSTRAINT affiliates_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: barber_availability barber_availability_barber_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.barber_availability
    ADD CONSTRAINT barber_availability_barber_id_date_key UNIQUE (barber_id, date);


--
-- Name: barber_availability barber_availability_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.barber_availability
    ADD CONSTRAINT barber_availability_pkey PRIMARY KEY (id);


--
-- Name: barber_leaves barber_leaves_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.barber_leaves
    ADD CONSTRAINT barber_leaves_pkey PRIMARY KEY (id);


--
-- Name: barber_performance barber_performance_barber_id_period_type_period_start_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.barber_performance
    ADD CONSTRAINT barber_performance_barber_id_period_type_period_start_key UNIQUE (barber_id, period_type, period_start);


--
-- Name: barber_performance barber_performance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.barber_performance
    ADD CONSTRAINT barber_performance_pkey PRIMARY KEY (id);


--
-- Name: barber_schedules barber_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.barber_schedules
    ADD CONSTRAINT barber_schedules_pkey PRIMARY KEY (id);


--
-- Name: barbers barbers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.barbers
    ADD CONSTRAINT barbers_pkey PRIMARY KEY (id);


--
-- Name: blocked_slots blocked_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocked_slots
    ADD CONSTRAINT blocked_slots_pkey PRIMARY KEY (id);


--
-- Name: business_niches business_niches_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_niches
    ADD CONSTRAINT business_niches_name_key UNIQUE (name);


--
-- Name: business_niches business_niches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_niches
    ADD CONSTRAINT business_niches_pkey PRIMARY KEY (id);


--
-- Name: business_niches business_niches_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_niches
    ADD CONSTRAINT business_niches_slug_key UNIQUE (slug);


--
-- Name: chatpro_config chatpro_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chatpro_config
    ADD CONSTRAINT chatpro_config_pkey PRIMARY KEY (id);


--
-- Name: contact_leads contact_leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_leads
    ADD CONSTRAINT contact_leads_pkey PRIMARY KEY (id);


--
-- Name: crm_audit_logs crm_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_audit_logs
    ADD CONSTRAINT crm_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: crm_collaborator_tokens crm_collaborator_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_collaborator_tokens
    ADD CONSTRAINT crm_collaborator_tokens_pkey PRIMARY KEY (id);


--
-- Name: crm_custom_fields crm_custom_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_custom_fields
    ADD CONSTRAINT crm_custom_fields_pkey PRIMARY KEY (id);


--
-- Name: crm_funnel_stages crm_funnel_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_funnel_stages
    ADD CONSTRAINT crm_funnel_stages_pkey PRIMARY KEY (id);


--
-- Name: crm_funnels crm_funnels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_funnels
    ADD CONSTRAINT crm_funnels_pkey PRIMARY KEY (id);


--
-- Name: crm_lead_history crm_lead_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_lead_history
    ADD CONSTRAINT crm_lead_history_pkey PRIMARY KEY (id);


--
-- Name: crm_lead_tags crm_lead_tags_lead_id_tag_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_lead_tags
    ADD CONSTRAINT crm_lead_tags_lead_id_tag_id_key UNIQUE (lead_id, tag_id);


--
-- Name: crm_lead_tags crm_lead_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_lead_tags
    ADD CONSTRAINT crm_lead_tags_pkey PRIMARY KEY (id);


--
-- Name: crm_leads crm_leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_leads
    ADD CONSTRAINT crm_leads_pkey PRIMARY KEY (id);


--
-- Name: crm_loss_reasons crm_loss_reasons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_loss_reasons
    ADD CONSTRAINT crm_loss_reasons_pkey PRIMARY KEY (id);


--
-- Name: crm_notifications crm_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_notifications
    ADD CONSTRAINT crm_notifications_pkey PRIMARY KEY (id);


--
-- Name: crm_pipelines crm_pipelines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_pipelines
    ADD CONSTRAINT crm_pipelines_pkey PRIMARY KEY (id);


--
-- Name: crm_tags crm_tags_crm_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_tags
    ADD CONSTRAINT crm_tags_crm_tenant_id_name_key UNIQUE (crm_tenant_id, name);


--
-- Name: crm_tags crm_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_tags
    ADD CONSTRAINT crm_tags_pkey PRIMARY KEY (id);


--
-- Name: crm_tasks crm_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_tasks
    ADD CONSTRAINT crm_tasks_pkey PRIMARY KEY (id);


--
-- Name: crm_tenants crm_tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_tenants
    ADD CONSTRAINT crm_tenants_pkey PRIMARY KEY (id);


--
-- Name: crm_users crm_users_auth_user_id_crm_tenant_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_users
    ADD CONSTRAINT crm_users_auth_user_id_crm_tenant_id_key UNIQUE (auth_user_id, crm_tenant_id);


--
-- Name: crm_users crm_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_users
    ADD CONSTRAINT crm_users_pkey PRIMARY KEY (id);


--
-- Name: email_confirmation_tokens email_confirmation_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_confirmation_tokens
    ADD CONSTRAINT email_confirmation_tokens_pkey PRIMARY KEY (id);


--
-- Name: email_confirmation_tokens email_confirmation_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_confirmation_tokens
    ADD CONSTRAINT email_confirmation_tokens_token_key UNIQUE (token);


--
-- Name: email_logs email_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_logs
    ADD CONSTRAINT email_logs_pkey PRIMARY KEY (id);


--
-- Name: email_templates email_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_pkey PRIMARY KEY (id);


--
-- Name: email_templates email_templates_template_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_template_type_key UNIQUE (template_type);


--
-- Name: email_webhook_events email_webhook_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_webhook_events
    ADD CONSTRAINT email_webhook_events_pkey PRIMARY KEY (id);


--
-- Name: feedbacks feedbacks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedbacks
    ADD CONSTRAINT feedbacks_pkey PRIMARY KEY (id);


--
-- Name: flow_ai_settings flow_ai_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flow_ai_settings
    ADD CONSTRAINT flow_ai_settings_pkey PRIMARY KEY (id);


--
-- Name: flow_ai_settings flow_ai_settings_scope_type_scope_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flow_ai_settings
    ADD CONSTRAINT flow_ai_settings_scope_type_scope_id_key UNIQUE (scope_type, scope_id);


--
-- Name: flow_execution_context flow_execution_context_execution_id_context_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flow_execution_context
    ADD CONSTRAINT flow_execution_context_execution_id_context_key_key UNIQUE (execution_id, context_key);


--
-- Name: flow_execution_context flow_execution_context_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flow_execution_context
    ADD CONSTRAINT flow_execution_context_pkey PRIMARY KEY (id);


--
-- Name: flow_execution_history flow_execution_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flow_execution_history
    ADD CONSTRAINT flow_execution_history_pkey PRIMARY KEY (id);


--
-- Name: flow_node_executions flow_node_executions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flow_node_executions
    ADD CONSTRAINT flow_node_executions_pkey PRIMARY KEY (id);


--
-- Name: fraud_protection fraud_protection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fraud_protection
    ADD CONSTRAINT fraud_protection_pkey PRIMARY KEY (id);


--
-- Name: genesis_alert_rules genesis_alert_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_alert_rules
    ADD CONSTRAINT genesis_alert_rules_pkey PRIMARY KEY (id);


--
-- Name: genesis_alerts genesis_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_alerts
    ADD CONSTRAINT genesis_alerts_pkey PRIMARY KEY (id);


--
-- Name: genesis_credit_transactions genesis_credit_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_credit_transactions
    ADD CONSTRAINT genesis_credit_transactions_pkey PRIMARY KEY (id);


--
-- Name: genesis_credit_usage genesis_credit_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_credit_usage
    ADD CONSTRAINT genesis_credit_usage_pkey PRIMARY KEY (id);


--
-- Name: genesis_credits genesis_credits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_credits
    ADD CONSTRAINT genesis_credits_pkey PRIMARY KEY (id);


--
-- Name: genesis_credits genesis_credits_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_credits
    ADD CONSTRAINT genesis_credits_user_id_key UNIQUE (user_id);


--
-- Name: genesis_event_logs genesis_event_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_event_logs
    ADD CONSTRAINT genesis_event_logs_pkey PRIMARY KEY (id);


--
-- Name: genesis_instance_events genesis_instance_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_instance_events
    ADD CONSTRAINT genesis_instance_events_pkey PRIMARY KEY (id);


--
-- Name: genesis_instance_failovers genesis_instance_failovers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_instance_failovers
    ADD CONSTRAINT genesis_instance_failovers_pkey PRIMARY KEY (id);


--
-- Name: genesis_instance_metrics genesis_instance_metrics_instance_id_period_start_period_ty_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_instance_metrics
    ADD CONSTRAINT genesis_instance_metrics_instance_id_period_start_period_ty_key UNIQUE (instance_id, period_start, period_type);


--
-- Name: genesis_instance_metrics genesis_instance_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_instance_metrics
    ADD CONSTRAINT genesis_instance_metrics_pkey PRIMARY KEY (id);


--
-- Name: genesis_instance_state_transitions genesis_instance_state_transitions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_instance_state_transitions
    ADD CONSTRAINT genesis_instance_state_transitions_pkey PRIMARY KEY (from_state, to_state);


--
-- Name: genesis_instance_tokens genesis_instance_tokens_jwt_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_instance_tokens
    ADD CONSTRAINT genesis_instance_tokens_jwt_id_key UNIQUE (jwt_id);


--
-- Name: genesis_instance_tokens genesis_instance_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_instance_tokens
    ADD CONSTRAINT genesis_instance_tokens_pkey PRIMARY KEY (id);


--
-- Name: genesis_instances genesis_instances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_instances
    ADD CONSTRAINT genesis_instances_pkey PRIMARY KEY (id);


--
-- Name: genesis_realtime_metrics genesis_realtime_metrics_instance_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_realtime_metrics
    ADD CONSTRAINT genesis_realtime_metrics_instance_id_key UNIQUE (instance_id);


--
-- Name: genesis_realtime_metrics genesis_realtime_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_realtime_metrics
    ADD CONSTRAINT genesis_realtime_metrics_pkey PRIMARY KEY (id);


--
-- Name: genesis_session_backups genesis_session_backups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_session_backups
    ADD CONSTRAINT genesis_session_backups_pkey PRIMARY KEY (id);


--
-- Name: genesis_subscriptions genesis_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_subscriptions
    ADD CONSTRAINT genesis_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: genesis_subscriptions genesis_subscriptions_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_subscriptions
    ADD CONSTRAINT genesis_subscriptions_user_id_key UNIQUE (user_id);


--
-- Name: genesis_user_roles genesis_user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_user_roles
    ADD CONSTRAINT genesis_user_roles_pkey PRIMARY KEY (id);


--
-- Name: genesis_user_roles genesis_user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_user_roles
    ADD CONSTRAINT genesis_user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: genesis_users genesis_users_auth_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_users
    ADD CONSTRAINT genesis_users_auth_user_id_key UNIQUE (auth_user_id);


--
-- Name: genesis_users genesis_users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_users
    ADD CONSTRAINT genesis_users_email_key UNIQUE (email);


--
-- Name: genesis_users genesis_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_users
    ADD CONSTRAINT genesis_users_pkey PRIMARY KEY (id);


--
-- Name: genesis_vps_nodes genesis_vps_nodes_base_url_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_vps_nodes
    ADD CONSTRAINT genesis_vps_nodes_base_url_key UNIQUE (base_url);


--
-- Name: genesis_vps_nodes genesis_vps_nodes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_vps_nodes
    ADD CONSTRAINT genesis_vps_nodes_pkey PRIMARY KEY (id);


--
-- Name: genesis_webhook_configs genesis_webhook_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_webhook_configs
    ADD CONSTRAINT genesis_webhook_configs_pkey PRIMARY KEY (id);


--
-- Name: genesis_webhook_configs genesis_webhook_configs_webhook_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_webhook_configs
    ADD CONSTRAINT genesis_webhook_configs_webhook_id_key UNIQUE (webhook_id);


--
-- Name: genesis_webhook_dead_letters genesis_webhook_dead_letters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_webhook_dead_letters
    ADD CONSTRAINT genesis_webhook_dead_letters_pkey PRIMARY KEY (id);


--
-- Name: genesis_webhook_events genesis_webhook_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_webhook_events
    ADD CONSTRAINT genesis_webhook_events_pkey PRIMARY KEY (id);


--
-- Name: genesis_webhook_rate_limits genesis_webhook_rate_limits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_webhook_rate_limits
    ADD CONSTRAINT genesis_webhook_rate_limits_pkey PRIMARY KEY (id);


--
-- Name: genesis_webhook_sources genesis_webhook_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_webhook_sources
    ADD CONSTRAINT genesis_webhook_sources_pkey PRIMARY KEY (id);


--
-- Name: genesis_webhooks genesis_webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_webhooks
    ADD CONSTRAINT genesis_webhooks_pkey PRIMARY KEY (id);


--
-- Name: login_attempts login_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.login_attempts
    ADD CONSTRAINT login_attempts_pkey PRIMARY KEY (id);


--
-- Name: marketing_campaigns marketing_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketing_campaigns
    ADD CONSTRAINT marketing_campaigns_pkey PRIMARY KEY (id);


--
-- Name: marketing_contacts marketing_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketing_contacts
    ADD CONSTRAINT marketing_contacts_pkey PRIMARY KEY (id);


--
-- Name: marketing_settings marketing_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketing_settings
    ADD CONSTRAINT marketing_settings_pkey PRIMARY KEY (id);


--
-- Name: message_templates message_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_templates
    ADD CONSTRAINT message_templates_pkey PRIMARY KEY (id);


--
-- Name: monthly_goals monthly_goals_barber_id_goal_type_month_year_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monthly_goals
    ADD CONSTRAINT monthly_goals_barber_id_goal_type_month_year_key UNIQUE (barber_id, goal_type, month, year);


--
-- Name: monthly_goals monthly_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monthly_goals
    ADD CONSTRAINT monthly_goals_pkey PRIMARY KEY (id);


--
-- Name: owner_github_config owner_github_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owner_github_config
    ADD CONSTRAINT owner_github_config_pkey PRIMARY KEY (id);


--
-- Name: owner_settings owner_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owner_settings
    ADD CONSTRAINT owner_settings_pkey PRIMARY KEY (id);


--
-- Name: owner_settings owner_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owner_settings
    ADD CONSTRAINT owner_settings_setting_key_key UNIQUE (setting_key);


--
-- Name: proposal_questionnaire_history proposal_questionnaire_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_questionnaire_history
    ADD CONSTRAINT proposal_questionnaire_history_pkey PRIMARY KEY (id);


--
-- Name: push_subscriptions push_subscriptions_endpoint_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_endpoint_key UNIQUE (endpoint);


--
-- Name: push_subscriptions push_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: queue queue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.queue
    ADD CONSTRAINT queue_pkey PRIMARY KEY (id);


--
-- Name: rate_limits rate_limits_identifier_endpoint_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_limits
    ADD CONSTRAINT rate_limits_identifier_endpoint_key UNIQUE (identifier, endpoint);


--
-- Name: rate_limits rate_limits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_limits
    ADD CONSTRAINT rate_limits_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: shop_settings shop_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_settings
    ADD CONSTRAINT shop_settings_pkey PRIMARY KEY (id);


--
-- Name: shop_subscriptions shop_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_subscriptions
    ADD CONSTRAINT shop_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: shop_subscriptions shop_subscriptions_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_subscriptions
    ADD CONSTRAINT shop_subscriptions_user_id_key UNIQUE (user_id);


--
-- Name: site_analytics site_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_analytics
    ADD CONSTRAINT site_analytics_pkey PRIMARY KEY (id);


--
-- Name: subscription_plans subscription_plans_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_name_key UNIQUE (name);


--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- Name: system_logs system_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: barber_schedules unique_barber_day; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.barber_schedules
    ADD CONSTRAINT unique_barber_day UNIQUE (barber_id, day_of_week);


--
-- Name: admin_settings unique_setting_type; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_settings
    ADD CONSTRAINT unique_setting_type UNIQUE (setting_type);


--
-- Name: usage_metrics usage_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_metrics
    ADD CONSTRAINT usage_metrics_pkey PRIMARY KEY (id);


--
-- Name: usage_metrics usage_metrics_user_id_month_year_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_metrics
    ADD CONSTRAINT usage_metrics_user_id_month_year_key UNIQUE (user_id, month, year);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: user_tenants user_tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tenants
    ADD CONSTRAINT user_tenants_pkey PRIMARY KEY (user_id);


--
-- Name: webhook_configs webhook_configs_event_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_configs
    ADD CONSTRAINT webhook_configs_event_type_key UNIQUE (event_type);


--
-- Name: webhook_configs webhook_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_configs
    ADD CONSTRAINT webhook_configs_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_alerts whatsapp_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_alerts
    ADD CONSTRAINT whatsapp_alerts_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_api_keys whatsapp_api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_api_keys
    ADD CONSTRAINT whatsapp_api_keys_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_api_logs whatsapp_api_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_api_logs
    ADD CONSTRAINT whatsapp_api_logs_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_api_projects whatsapp_api_projects_api_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_api_projects
    ADD CONSTRAINT whatsapp_api_projects_api_key_key UNIQUE (api_key);


--
-- Name: whatsapp_api_projects whatsapp_api_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_api_projects
    ADD CONSTRAINT whatsapp_api_projects_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_audit_logs whatsapp_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_audit_logs
    ADD CONSTRAINT whatsapp_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_automation_rules whatsapp_automation_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_automation_rules
    ADD CONSTRAINT whatsapp_automation_rules_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_automation_templates whatsapp_automation_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_automation_templates
    ADD CONSTRAINT whatsapp_automation_templates_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_automation_templates whatsapp_automation_templates_template_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_automation_templates
    ADD CONSTRAINT whatsapp_automation_templates_template_type_key UNIQUE (template_type);


--
-- Name: whatsapp_automations whatsapp_automations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_automations
    ADD CONSTRAINT whatsapp_automations_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_away_messages whatsapp_away_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_away_messages
    ADD CONSTRAINT whatsapp_away_messages_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_backend_config whatsapp_backend_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_backend_config
    ADD CONSTRAINT whatsapp_backend_config_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_business_hours whatsapp_business_hours_instance_id_day_of_week_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_business_hours
    ADD CONSTRAINT whatsapp_business_hours_instance_id_day_of_week_key UNIQUE (instance_id, day_of_week);


--
-- Name: whatsapp_business_hours whatsapp_business_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_business_hours
    ADD CONSTRAINT whatsapp_business_hours_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_button_actions whatsapp_button_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_button_actions
    ADD CONSTRAINT whatsapp_button_actions_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_button_clicks whatsapp_button_clicks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_button_clicks
    ADD CONSTRAINT whatsapp_button_clicks_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_circuit_breaker whatsapp_circuit_breaker_instance_id_circuit_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_circuit_breaker
    ADD CONSTRAINT whatsapp_circuit_breaker_instance_id_circuit_name_key UNIQUE (instance_id, circuit_name);


--
-- Name: whatsapp_circuit_breaker whatsapp_circuit_breaker_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_circuit_breaker
    ADD CONSTRAINT whatsapp_circuit_breaker_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_contacts whatsapp_contacts_instance_id_phone_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_contacts
    ADD CONSTRAINT whatsapp_contacts_instance_id_phone_key UNIQUE (instance_id, phone);


--
-- Name: whatsapp_contacts whatsapp_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_contacts
    ADD CONSTRAINT whatsapp_contacts_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_conversation_states whatsapp_conversation_states_instance_id_phone_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_conversation_states
    ADD CONSTRAINT whatsapp_conversation_states_instance_id_phone_key UNIQUE (instance_id, phone);


--
-- Name: whatsapp_conversation_states whatsapp_conversation_states_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_conversation_states
    ADD CONSTRAINT whatsapp_conversation_states_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_conversations whatsapp_conversations_instance_id_phone_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_conversations
    ADD CONSTRAINT whatsapp_conversations_instance_id_phone_key UNIQUE (instance_id, phone);


--
-- Name: whatsapp_conversations whatsapp_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_conversations
    ADD CONSTRAINT whatsapp_conversations_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_event_queue whatsapp_event_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_event_queue
    ADD CONSTRAINT whatsapp_event_queue_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_external_webhooks whatsapp_external_webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_external_webhooks
    ADD CONSTRAINT whatsapp_external_webhooks_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_flow_edges whatsapp_flow_edges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_flow_edges
    ADD CONSTRAINT whatsapp_flow_edges_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_flow_edges whatsapp_flow_edges_rule_id_edge_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_flow_edges
    ADD CONSTRAINT whatsapp_flow_edges_rule_id_edge_id_key UNIQUE (rule_id, edge_id);


--
-- Name: whatsapp_flow_nodes whatsapp_flow_nodes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_flow_nodes
    ADD CONSTRAINT whatsapp_flow_nodes_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_flow_nodes whatsapp_flow_nodes_rule_id_node_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_flow_nodes
    ADD CONSTRAINT whatsapp_flow_nodes_rule_id_node_id_key UNIQUE (rule_id, node_id);


--
-- Name: whatsapp_group_participants whatsapp_group_participants_group_id_phone_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_group_participants
    ADD CONSTRAINT whatsapp_group_participants_group_id_phone_key UNIQUE (group_id, phone);


--
-- Name: whatsapp_group_participants whatsapp_group_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_group_participants
    ADD CONSTRAINT whatsapp_group_participants_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_groups whatsapp_groups_instance_id_group_jid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_groups
    ADD CONSTRAINT whatsapp_groups_instance_id_group_jid_key UNIQUE (instance_id, group_jid);


--
-- Name: whatsapp_groups whatsapp_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_groups
    ADD CONSTRAINT whatsapp_groups_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_health_checks whatsapp_health_checks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_health_checks
    ADD CONSTRAINT whatsapp_health_checks_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_inbox whatsapp_inbox_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_inbox
    ADD CONSTRAINT whatsapp_inbox_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_instances whatsapp_instances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_instances
    ADD CONSTRAINT whatsapp_instances_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_interactive_templates whatsapp_interactive_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_interactive_templates
    ADD CONSTRAINT whatsapp_interactive_templates_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_labels whatsapp_labels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_labels
    ADD CONSTRAINT whatsapp_labels_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_message_logs whatsapp_message_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_message_logs
    ADD CONSTRAINT whatsapp_message_logs_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_metrics whatsapp_metrics_instance_id_metric_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_metrics
    ADD CONSTRAINT whatsapp_metrics_instance_id_metric_date_key UNIQUE (instance_id, metric_date);


--
-- Name: whatsapp_metrics whatsapp_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_metrics
    ADD CONSTRAINT whatsapp_metrics_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_phone_validation whatsapp_phone_validation_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_phone_validation
    ADD CONSTRAINT whatsapp_phone_validation_phone_number_key UNIQUE (phone_number);


--
-- Name: whatsapp_phone_validation whatsapp_phone_validation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_phone_validation
    ADD CONSTRAINT whatsapp_phone_validation_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_project_instances whatsapp_project_instances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_project_instances
    ADD CONSTRAINT whatsapp_project_instances_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_project_instances whatsapp_project_instances_project_id_instance_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_project_instances
    ADD CONSTRAINT whatsapp_project_instances_project_id_instance_id_key UNIQUE (project_id, instance_id);


--
-- Name: whatsapp_quick_replies whatsapp_quick_replies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_quick_replies
    ADD CONSTRAINT whatsapp_quick_replies_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_rate_limits whatsapp_rate_limits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_rate_limits
    ADD CONSTRAINT whatsapp_rate_limits_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_rate_limits whatsapp_rate_limits_project_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_rate_limits
    ADD CONSTRAINT whatsapp_rate_limits_project_id_key UNIQUE (project_id);


--
-- Name: whatsapp_scheduled_messages whatsapp_scheduled_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_scheduled_messages
    ADD CONSTRAINT whatsapp_scheduled_messages_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_security_settings whatsapp_security_settings_instance_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_security_settings
    ADD CONSTRAINT whatsapp_security_settings_instance_id_key UNIQUE (instance_id);


--
-- Name: whatsapp_security_settings whatsapp_security_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_security_settings
    ADD CONSTRAINT whatsapp_security_settings_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_send_queue whatsapp_send_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_send_queue
    ADD CONSTRAINT whatsapp_send_queue_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_stability_logs whatsapp_stability_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_stability_logs
    ADD CONSTRAINT whatsapp_stability_logs_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_template_sends whatsapp_template_sends_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_template_sends
    ADD CONSTRAINT whatsapp_template_sends_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_templates whatsapp_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_templates
    ADD CONSTRAINT whatsapp_templates_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_templates whatsapp_templates_template_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_templates
    ADD CONSTRAINT whatsapp_templates_template_type_key UNIQUE (template_type);


--
-- Name: whatsapp_webhook_logs whatsapp_webhook_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_webhook_logs
    ADD CONSTRAINT whatsapp_webhook_logs_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_webhooks whatsapp_webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_webhooks
    ADD CONSTRAINT whatsapp_webhooks_pkey PRIMARY KEY (id);


--
-- Name: idx_admin_settings_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_settings_tenant_id ON public.admin_settings USING btree (tenant_id);


--
-- Name: idx_affiliate_proposals_affiliate_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_affiliate_proposals_affiliate_id ON public.affiliate_proposals USING btree (affiliate_id);


--
-- Name: idx_affiliate_proposals_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_affiliate_proposals_created_at ON public.affiliate_proposals USING btree (created_at DESC);


--
-- Name: idx_affiliate_proposals_niche; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_affiliate_proposals_niche ON public.affiliate_proposals USING btree (niche_id);


--
-- Name: idx_affiliate_proposals_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_affiliate_proposals_status ON public.affiliate_proposals USING btree (status);


--
-- Name: idx_affiliate_verification_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_affiliate_verification_expires ON public.affiliate_verification_codes USING btree (expires_at);


--
-- Name: idx_affiliate_verification_phone_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_affiliate_verification_phone_code ON public.affiliate_verification_codes USING btree (phone, code);


--
-- Name: idx_affiliates_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_affiliates_code ON public.affiliates USING btree (affiliate_code);


--
-- Name: idx_affiliates_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_affiliates_email ON public.affiliates USING btree (email);


--
-- Name: idx_affiliates_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_affiliates_status ON public.affiliates USING btree (status);


--
-- Name: idx_alerts_unresolved; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_alerts_unresolved ON public.whatsapp_alerts USING btree (instance_id, is_resolved) WHERE (is_resolved = false);


--
-- Name: idx_appointments_date_barber_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_date_barber_tenant ON public.appointments USING btree (date, barber_id, tenant_id);


--
-- Name: idx_appointments_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_tenant_id ON public.appointments USING btree (tenant_id);


--
-- Name: idx_appointments_tenant_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_tenant_status ON public.appointments USING btree (tenant_id, status);


--
-- Name: idx_audit_logs_action_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_action_date ON public.audit_logs USING btree (action, created_at DESC);


--
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at DESC);


--
-- Name: idx_audit_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);


--
-- Name: idx_barber_availability_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_barber_availability_tenant_id ON public.barber_availability USING btree (tenant_id);


--
-- Name: idx_barber_leaves_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_barber_leaves_tenant_id ON public.barber_leaves USING btree (tenant_id);


--
-- Name: idx_barber_performance_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_barber_performance_tenant_id ON public.barber_performance USING btree (tenant_id);


--
-- Name: idx_barber_schedules_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_barber_schedules_tenant_id ON public.barber_schedules USING btree (tenant_id);


--
-- Name: idx_barbers_tenant_available; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_barbers_tenant_available ON public.barbers USING btree (tenant_id, available);


--
-- Name: idx_barbers_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_barbers_tenant_id ON public.barbers USING btree (tenant_id);


--
-- Name: idx_blocked_slots_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blocked_slots_tenant_id ON public.blocked_slots USING btree (tenant_id);


--
-- Name: idx_business_niches_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_business_niches_active ON public.business_niches USING btree (is_active);


--
-- Name: idx_business_niches_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_business_niches_slug ON public.business_niches USING btree (slug);


--
-- Name: idx_chatpro_config_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chatpro_config_tenant_id ON public.chatpro_config USING btree (tenant_id);


--
-- Name: idx_circuit_breaker_state; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_circuit_breaker_state ON public.whatsapp_circuit_breaker USING btree (state);


--
-- Name: idx_clicks_affiliate; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clicks_affiliate ON public.affiliate_clicks USING btree (affiliate_id);


--
-- Name: idx_crm_audit_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crm_audit_tenant ON public.crm_audit_logs USING btree (crm_tenant_id);


--
-- Name: idx_crm_lead_history_lead; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crm_lead_history_lead ON public.crm_lead_history USING btree (lead_id);


--
-- Name: idx_crm_leads_funnel; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crm_leads_funnel ON public.crm_leads USING btree (funnel_id);


--
-- Name: idx_crm_leads_responsible; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crm_leads_responsible ON public.crm_leads USING btree (responsible_id);


--
-- Name: idx_crm_leads_stage; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crm_leads_stage ON public.crm_leads USING btree (stage_id);


--
-- Name: idx_crm_leads_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crm_leads_status ON public.crm_leads USING btree (status);


--
-- Name: idx_crm_leads_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crm_leads_tenant ON public.crm_leads USING btree (crm_tenant_id);


--
-- Name: idx_crm_tasks_assigned; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crm_tasks_assigned ON public.crm_tasks USING btree (assigned_to);


--
-- Name: idx_crm_tasks_due; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crm_tasks_due ON public.crm_tasks USING btree (due_date);


--
-- Name: idx_crm_tasks_lead; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crm_tasks_lead ON public.crm_tasks USING btree (lead_id);


--
-- Name: idx_crm_tasks_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crm_tasks_tenant ON public.crm_tasks USING btree (crm_tenant_id);


--
-- Name: idx_crm_users_auth_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crm_users_auth_user ON public.crm_users USING btree (auth_user_id);


--
-- Name: idx_crm_users_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crm_users_tenant ON public.crm_users USING btree (crm_tenant_id);


--
-- Name: idx_email_confirmation_tokens_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_confirmation_tokens_token ON public.email_confirmation_tokens USING btree (token);


--
-- Name: idx_email_confirmation_tokens_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_confirmation_tokens_user_id ON public.email_confirmation_tokens USING btree (user_id);


--
-- Name: idx_email_webhook_events_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_webhook_events_created_at ON public.email_webhook_events USING btree (created_at DESC);


--
-- Name: idx_failovers_instance; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_failovers_instance ON public.genesis_instance_failovers USING btree (instance_id, status);


--
-- Name: idx_feedbacks_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_feedbacks_tenant_id ON public.feedbacks USING btree (tenant_id);


--
-- Name: idx_feedbacks_tenant_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_feedbacks_tenant_status ON public.feedbacks USING btree (tenant_id, status);


--
-- Name: idx_flow_edges_rule; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_flow_edges_rule ON public.whatsapp_flow_edges USING btree (rule_id);


--
-- Name: idx_flow_execution_context_execution_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_flow_execution_context_execution_id ON public.flow_execution_context USING btree (execution_id);


--
-- Name: idx_flow_execution_context_flow_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_flow_execution_context_flow_id ON public.flow_execution_context USING btree (flow_id);


--
-- Name: idx_flow_execution_history_execution_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_flow_execution_history_execution_id ON public.flow_execution_history USING btree (execution_id);


--
-- Name: idx_flow_execution_history_flow_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_flow_execution_history_flow_id ON public.flow_execution_history USING btree (flow_id);


--
-- Name: idx_flow_execution_history_started_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_flow_execution_history_started_at ON public.flow_execution_history USING btree (started_at DESC);


--
-- Name: idx_flow_execution_history_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_flow_execution_history_status ON public.flow_execution_history USING btree (status);


--
-- Name: idx_flow_node_executions_execution_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_flow_node_executions_execution_id ON public.flow_node_executions USING btree (execution_id);


--
-- Name: idx_flow_node_executions_flow_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_flow_node_executions_flow_id ON public.flow_node_executions USING btree (flow_id);


--
-- Name: idx_flow_node_executions_node_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_flow_node_executions_node_id ON public.flow_node_executions USING btree (node_id);


--
-- Name: idx_flow_nodes_rule; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_flow_nodes_rule ON public.whatsapp_flow_nodes USING btree (rule_id);


--
-- Name: idx_genesis_alert_rules_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_alert_rules_user ON public.genesis_alert_rules USING btree (user_id, is_enabled);


--
-- Name: idx_genesis_alerts_instance; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_alerts_instance ON public.genesis_alerts USING btree (instance_id, status) WHERE (instance_id IS NOT NULL);


--
-- Name: idx_genesis_alerts_severity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_alerts_severity ON public.genesis_alerts USING btree (severity, status) WHERE (status = 'active'::text);


--
-- Name: idx_genesis_alerts_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_alerts_user_status ON public.genesis_alerts USING btree (user_id, status, created_at DESC);


--
-- Name: idx_genesis_credit_transactions_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_credit_transactions_created_at ON public.genesis_credit_transactions USING btree (created_at DESC);


--
-- Name: idx_genesis_credit_transactions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_credit_transactions_user_id ON public.genesis_credit_transactions USING btree (user_id);


--
-- Name: idx_genesis_credit_usage_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_credit_usage_date ON public.genesis_credit_usage USING btree (usage_date);


--
-- Name: idx_genesis_credit_usage_instance; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_credit_usage_instance ON public.genesis_credit_usage USING btree (instance_id);


--
-- Name: idx_genesis_credit_usage_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_credit_usage_user ON public.genesis_credit_usage USING btree (user_id);


--
-- Name: idx_genesis_event_logs_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_event_logs_created ON public.genesis_event_logs USING btree (created_at DESC);


--
-- Name: idx_genesis_event_logs_instance; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_event_logs_instance ON public.genesis_event_logs USING btree (instance_id);


--
-- Name: idx_genesis_event_logs_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_event_logs_type ON public.genesis_event_logs USING btree (event_type);


--
-- Name: idx_genesis_event_logs_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_event_logs_user ON public.genesis_event_logs USING btree (user_id);


--
-- Name: idx_genesis_instances_heartbeat; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_instances_heartbeat ON public.genesis_instances USING btree (last_heartbeat) WHERE (last_heartbeat IS NOT NULL);


--
-- Name: idx_genesis_instances_orchestrated_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_instances_orchestrated_status ON public.genesis_instances USING btree (orchestrated_status);


--
-- Name: idx_genesis_instances_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_instances_status ON public.genesis_instances USING btree (status);


--
-- Name: idx_genesis_instances_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_instances_user_id ON public.genesis_instances USING btree (user_id);


--
-- Name: idx_genesis_metrics_instance_period; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_metrics_instance_period ON public.genesis_instance_metrics USING btree (instance_id, period_start DESC);


--
-- Name: idx_genesis_metrics_user_period; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_metrics_user_period ON public.genesis_instance_metrics USING btree (user_id, period_type, period_start DESC);


--
-- Name: idx_genesis_realtime_instance; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_realtime_instance ON public.genesis_realtime_metrics USING btree (instance_id);


--
-- Name: idx_genesis_users_auth_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_users_auth_user_id ON public.genesis_users USING btree (auth_user_id);


--
-- Name: idx_genesis_webhook_configs_flow_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_webhook_configs_flow_id ON public.genesis_webhook_configs USING btree (flow_id);


--
-- Name: idx_genesis_webhook_configs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_webhook_configs_user_id ON public.genesis_webhook_configs USING btree (user_id);


--
-- Name: idx_genesis_webhook_configs_webhook_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_webhook_configs_webhook_id ON public.genesis_webhook_configs USING btree (webhook_id);


--
-- Name: idx_genesis_webhook_dead_letters_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_webhook_dead_letters_status ON public.genesis_webhook_dead_letters USING btree (status);


--
-- Name: idx_genesis_webhook_events_config_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_webhook_events_config_id ON public.genesis_webhook_events USING btree (webhook_config_id);


--
-- Name: idx_genesis_webhook_events_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_webhook_events_event_id ON public.genesis_webhook_events USING btree (event_id);


--
-- Name: idx_genesis_webhook_events_received_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_webhook_events_received_at ON public.genesis_webhook_events USING btree (received_at);


--
-- Name: idx_genesis_webhook_events_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_webhook_events_status ON public.genesis_webhook_events USING btree (status);


--
-- Name: idx_genesis_webhook_rate_limits_ip; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_webhook_rate_limits_ip ON public.genesis_webhook_rate_limits USING btree (webhook_config_id, source_ip);


--
-- Name: idx_genesis_webhooks_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_genesis_webhooks_user ON public.genesis_webhooks USING btree (user_id);


--
-- Name: idx_instance_events_instance_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_instance_events_instance_time ON public.genesis_instance_events USING btree (instance_id, created_at DESC);


--
-- Name: idx_instance_events_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_instance_events_type ON public.genesis_instance_events USING btree (event_type);


--
-- Name: idx_instances_health; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_instances_health ON public.genesis_instances USING btree (health_status, last_health_ping);


--
-- Name: idx_instances_node; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_instances_node ON public.genesis_instances USING btree (vps_node_id);


--
-- Name: idx_marketing_campaigns_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_marketing_campaigns_tenant_id ON public.marketing_campaigns USING btree (tenant_id);


--
-- Name: idx_marketing_contacts_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_marketing_contacts_tenant_id ON public.marketing_contacts USING btree (tenant_id);


--
-- Name: idx_marketing_settings_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_marketing_settings_tenant_id ON public.marketing_settings USING btree (tenant_id);


--
-- Name: idx_message_templates_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_message_templates_tenant_id ON public.message_templates USING btree (tenant_id);


--
-- Name: idx_monthly_goals_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_monthly_goals_tenant_id ON public.monthly_goals USING btree (tenant_id);


--
-- Name: idx_phone_validation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_phone_validation ON public.whatsapp_phone_validation USING btree (phone_number);


--
-- Name: idx_push_subscriptions_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_push_subscriptions_tenant_id ON public.push_subscriptions USING btree (tenant_id);


--
-- Name: idx_questionnaire_history_proposal; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_questionnaire_history_proposal ON public.proposal_questionnaire_history USING btree (proposal_id);


--
-- Name: idx_queue_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_queue_tenant_id ON public.queue USING btree (tenant_id);


--
-- Name: idx_queue_tenant_position; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_queue_tenant_position ON public.queue USING btree (tenant_id, "position");


--
-- Name: idx_rate_limits_identifier_endpoint; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rate_limits_identifier_endpoint ON public.rate_limits USING btree (identifier, endpoint, window_start);


--
-- Name: idx_referrals_affiliate; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_referrals_affiliate ON public.affiliate_referrals USING btree (affiliate_id);


--
-- Name: idx_referrals_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_referrals_status ON public.affiliate_referrals USING btree (status);


--
-- Name: idx_referrals_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_referrals_user ON public.affiliate_referrals USING btree (referred_user_id);


--
-- Name: idx_rules_instance; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rules_instance ON public.whatsapp_automation_rules USING btree (instance_id);


--
-- Name: idx_rules_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rules_user ON public.whatsapp_automation_rules USING btree (user_id);


--
-- Name: idx_rules_user_instance; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rules_user_instance ON public.whatsapp_automation_rules USING btree (user_id, instance_id);


--
-- Name: idx_send_queue_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_send_queue_status ON public.whatsapp_send_queue USING btree (status, next_attempt_at);


--
-- Name: idx_services_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_services_tenant_id ON public.services USING btree (tenant_id);


--
-- Name: idx_services_tenant_visible; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_services_tenant_visible ON public.services USING btree (tenant_id, visible);


--
-- Name: idx_session_backups_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_backups_expires ON public.genesis_session_backups USING btree (expires_at) WHERE (is_valid = true);


--
-- Name: idx_session_backups_instance; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_backups_instance ON public.genesis_session_backups USING btree (instance_id);


--
-- Name: idx_session_backups_valid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_backups_valid ON public.genesis_session_backups USING btree (instance_id, is_valid, created_at DESC);


--
-- Name: idx_shop_settings_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shop_settings_tenant_id ON public.shop_settings USING btree (tenant_id);


--
-- Name: idx_shop_subscriptions_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shop_subscriptions_tenant_id ON public.shop_subscriptions USING btree (tenant_id);


--
-- Name: idx_site_analytics_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_site_analytics_tenant_id ON public.site_analytics USING btree (tenant_id);


--
-- Name: idx_stability_logs_instance; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stability_logs_instance ON public.whatsapp_stability_logs USING btree (instance_id, created_at DESC);


--
-- Name: idx_tokens_instance_valid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tokens_instance_valid ON public.genesis_instance_tokens USING btree (instance_id, expires_at) WHERE (revoked = false);


--
-- Name: idx_usage_metrics_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usage_metrics_tenant_id ON public.usage_metrics USING btree (tenant_id);


--
-- Name: idx_user_profiles_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_profiles_tenant_id ON public.user_profiles USING btree (tenant_id);


--
-- Name: idx_user_tenants_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_tenants_tenant_id ON public.user_tenants USING btree (tenant_id);


--
-- Name: idx_user_tenants_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_tenants_user_id ON public.user_tenants USING btree (user_id);


--
-- Name: idx_vps_nodes_capacity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vps_nodes_capacity ON public.genesis_vps_nodes USING btree (current_instances, max_instances) WHERE ((is_active = true) AND (status = 'online'::text));


--
-- Name: idx_vps_nodes_region; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vps_nodes_region ON public.genesis_vps_nodes USING btree (region, health_score DESC);


--
-- Name: idx_vps_nodes_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vps_nodes_status ON public.genesis_vps_nodes USING btree (status, is_active);


--
-- Name: idx_wa_button_clicks_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wa_button_clicks_created ON public.whatsapp_button_clicks USING btree (created_at DESC);


--
-- Name: idx_wa_button_clicks_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wa_button_clicks_phone ON public.whatsapp_button_clicks USING btree (phone);


--
-- Name: idx_wa_conv_states_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wa_conv_states_phone ON public.whatsapp_conversation_states USING btree (phone);


--
-- Name: idx_wa_conv_states_state; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wa_conv_states_state ON public.whatsapp_conversation_states USING btree (current_state);


--
-- Name: idx_wa_interactive_templates_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wa_interactive_templates_active ON public.whatsapp_interactive_templates USING btree (is_active);


--
-- Name: idx_wa_interactive_templates_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wa_interactive_templates_type ON public.whatsapp_interactive_templates USING btree (template_type);


--
-- Name: idx_wa_template_sends_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wa_template_sends_phone ON public.whatsapp_template_sends USING btree (phone);


--
-- Name: idx_wa_template_sends_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wa_template_sends_status ON public.whatsapp_template_sends USING btree (status);


--
-- Name: idx_webhook_configs_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_webhook_configs_tenant_id ON public.webhook_configs USING btree (tenant_id);


--
-- Name: idx_webhook_sources_identifier; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_webhook_sources_identifier ON public.genesis_webhook_sources USING btree (source_type, source_identifier) WHERE (active = true);


--
-- Name: idx_whatsapp_alerts_unresolved; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_alerts_unresolved ON public.whatsapp_alerts USING btree (instance_id, is_resolved) WHERE (is_resolved = false);


--
-- Name: idx_whatsapp_api_keys_prefix; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_api_keys_prefix ON public.whatsapp_api_keys USING btree (key_prefix);


--
-- Name: idx_whatsapp_api_logs_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_api_logs_created ON public.whatsapp_api_logs USING btree (created_at DESC);


--
-- Name: idx_whatsapp_api_logs_idempotency; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_api_logs_idempotency ON public.whatsapp_api_logs USING btree (idempotency_key) WHERE (idempotency_key IS NOT NULL);


--
-- Name: idx_whatsapp_api_logs_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_api_logs_project ON public.whatsapp_api_logs USING btree (project_id);


--
-- Name: idx_whatsapp_api_projects_api_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_api_projects_api_key ON public.whatsapp_api_projects USING btree (api_key);


--
-- Name: idx_whatsapp_api_projects_owner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_api_projects_owner ON public.whatsapp_api_projects USING btree (owner_user_id);


--
-- Name: idx_whatsapp_audit_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_audit_action ON public.whatsapp_audit_logs USING btree (action, created_at DESC);


--
-- Name: idx_whatsapp_audit_instance; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_audit_instance ON public.whatsapp_audit_logs USING btree (instance_id, created_at DESC);


--
-- Name: idx_whatsapp_automation_rules_instance; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_automation_rules_instance ON public.whatsapp_automation_rules USING btree (instance_id);


--
-- Name: idx_whatsapp_automation_rules_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_automation_rules_project ON public.whatsapp_automation_rules USING btree (project_id);


--
-- Name: idx_whatsapp_automation_rules_trigger; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_automation_rules_trigger ON public.whatsapp_automation_rules USING btree (trigger_type, is_active);


--
-- Name: idx_whatsapp_automations_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_automations_active ON public.whatsapp_automations USING btree (is_active, trigger_type);


--
-- Name: idx_whatsapp_contacts_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_contacts_phone ON public.whatsapp_contacts USING btree (phone);


--
-- Name: idx_whatsapp_contacts_tags; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_contacts_tags ON public.whatsapp_contacts USING gin (tags);


--
-- Name: idx_whatsapp_conversations_instance; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_conversations_instance ON public.whatsapp_conversations USING btree (instance_id);


--
-- Name: idx_whatsapp_conversations_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_conversations_phone ON public.whatsapp_conversations USING btree (phone);


--
-- Name: idx_whatsapp_event_queue_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_event_queue_project ON public.whatsapp_event_queue USING btree (project_id);


--
-- Name: idx_whatsapp_event_queue_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_event_queue_status ON public.whatsapp_event_queue USING btree (status, scheduled_for);


--
-- Name: idx_whatsapp_external_webhooks_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_external_webhooks_project ON public.whatsapp_external_webhooks USING btree (project_id);


--
-- Name: idx_whatsapp_health_instance; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_health_instance ON public.whatsapp_health_checks USING btree (instance_id, checked_at DESC);


--
-- Name: idx_whatsapp_inbox_instance; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_inbox_instance ON public.whatsapp_inbox USING btree (instance_id);


--
-- Name: idx_whatsapp_inbox_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_inbox_phone ON public.whatsapp_inbox USING btree (phone_from);


--
-- Name: idx_whatsapp_inbox_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_inbox_unread ON public.whatsapp_inbox USING btree (instance_id, is_read) WHERE (is_read = false);


--
-- Name: idx_whatsapp_instances_heartbeat; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_instances_heartbeat ON public.whatsapp_instances USING btree (last_heartbeat) WHERE (last_heartbeat IS NOT NULL);


--
-- Name: idx_whatsapp_instances_status_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_instances_status_active ON public.whatsapp_instances USING btree (status, is_active) WHERE ((status = 'connected'::text) AND (is_active = true));


--
-- Name: idx_whatsapp_metrics_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_metrics_date ON public.whatsapp_metrics USING btree (instance_id, metric_date DESC);


--
-- Name: idx_whatsapp_queue_processing; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_queue_processing ON public.whatsapp_send_queue USING btree (status, next_attempt_at, priority);


--
-- Name: idx_whatsapp_scheduled_pending; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_scheduled_pending ON public.whatsapp_scheduled_messages USING btree (scheduled_at, status) WHERE (status = 'pending'::text);


--
-- Name: idx_whatsapp_webhook_logs_webhook; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whatsapp_webhook_logs_webhook ON public.whatsapp_webhook_logs USING btree (webhook_id, created_at DESC);


--
-- Name: idx_withdrawals_affiliate; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_withdrawals_affiliate ON public.affiliate_withdrawals USING btree (affiliate_id);


--
-- Name: idx_withdrawals_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_withdrawals_status ON public.affiliate_withdrawals USING btree (status);


--
-- Name: message_templates_event_type_tenant_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX message_templates_event_type_tenant_unique ON public.message_templates USING btree (event_type, tenant_id);


--
-- Name: owner_github_config_singleton; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX owner_github_config_singleton ON public.owner_github_config USING btree ((true));


--
-- Name: queue_unique_appointment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX queue_unique_appointment_id ON public.queue USING btree (appointment_id);


--
-- Name: crm_funnels crm_funnels_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER crm_funnels_updated_at BEFORE UPDATE ON public.crm_funnels FOR EACH ROW EXECUTE FUNCTION public.crm_update_timestamp();


--
-- Name: crm_leads crm_leads_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER crm_leads_updated_at BEFORE UPDATE ON public.crm_leads FOR EACH ROW EXECUTE FUNCTION public.crm_update_timestamp();


--
-- Name: crm_pipelines crm_pipelines_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER crm_pipelines_updated_at BEFORE UPDATE ON public.crm_pipelines FOR EACH ROW EXECUTE FUNCTION public.crm_update_timestamp();


--
-- Name: crm_funnel_stages crm_stages_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER crm_stages_updated_at BEFORE UPDATE ON public.crm_funnel_stages FOR EACH ROW EXECUTE FUNCTION public.crm_update_timestamp();


--
-- Name: crm_tasks crm_tasks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER crm_tasks_updated_at BEFORE UPDATE ON public.crm_tasks FOR EACH ROW EXECUTE FUNCTION public.crm_update_timestamp();


--
-- Name: crm_tenants crm_tenants_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER crm_tenants_updated_at BEFORE UPDATE ON public.crm_tenants FOR EACH ROW EXECUTE FUNCTION public.crm_update_timestamp();


--
-- Name: crm_users crm_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER crm_users_updated_at BEFORE UPDATE ON public.crm_users FOR EACH ROW EXECUTE FUNCTION public.crm_update_timestamp();


--
-- Name: genesis_webhooks genesis_webhooks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER genesis_webhooks_updated_at BEFORE UPDATE ON public.genesis_webhooks FOR EACH ROW EXECUTE FUNCTION public.update_genesis_updated_at();


--
-- Name: genesis_instances trg_block_direct_status_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_block_direct_status_update BEFORE UPDATE ON public.genesis_instances FOR EACH ROW EXECUTE FUNCTION public.genesis_block_direct_status_update();


--
-- Name: genesis_instance_events trg_block_event_delete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_block_event_delete BEFORE DELETE ON public.genesis_instance_events FOR EACH ROW EXECUTE FUNCTION public.genesis_block_event_delete();


--
-- Name: genesis_instance_events trg_block_event_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_block_event_update BEFORE UPDATE ON public.genesis_instance_events FOR EACH ROW EXECUTE FUNCTION public.genesis_block_event_update();


--
-- Name: appointments trg_cleanup_queue_on_appointment_done; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_cleanup_queue_on_appointment_done AFTER UPDATE OF status ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.cleanup_queue_on_appointment_done();


--
-- Name: queue trg_prevent_queue_status_regression; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_prevent_queue_status_regression BEFORE UPDATE OF status ON public.queue FOR EACH ROW EXECUTE FUNCTION public.prevent_queue_status_regression();


--
-- Name: admin_settings trg_set_tenant_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_tenant_id BEFORE INSERT ON public.admin_settings FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_on_insert();


--
-- Name: appointments trg_set_tenant_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_tenant_id BEFORE INSERT ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_on_insert();


--
-- Name: barber_availability trg_set_tenant_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_tenant_id BEFORE INSERT ON public.barber_availability FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_on_insert();


--
-- Name: barber_leaves trg_set_tenant_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_tenant_id BEFORE INSERT ON public.barber_leaves FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_on_insert();


--
-- Name: barber_performance trg_set_tenant_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_tenant_id BEFORE INSERT ON public.barber_performance FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_on_insert();


--
-- Name: barber_schedules trg_set_tenant_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_tenant_id BEFORE INSERT ON public.barber_schedules FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_on_insert();


--
-- Name: barbers trg_set_tenant_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_tenant_id BEFORE INSERT ON public.barbers FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_on_insert();


--
-- Name: blocked_slots trg_set_tenant_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_tenant_id BEFORE INSERT ON public.blocked_slots FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_on_insert();


--
-- Name: chatpro_config trg_set_tenant_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_tenant_id BEFORE INSERT ON public.chatpro_config FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_on_insert();


--
-- Name: feedbacks trg_set_tenant_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_tenant_id BEFORE INSERT ON public.feedbacks FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_on_insert();


--
-- Name: marketing_campaigns trg_set_tenant_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_tenant_id BEFORE INSERT ON public.marketing_campaigns FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_on_insert();


--
-- Name: marketing_contacts trg_set_tenant_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_tenant_id BEFORE INSERT ON public.marketing_contacts FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_on_insert();


--
-- Name: marketing_settings trg_set_tenant_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_tenant_id BEFORE INSERT ON public.marketing_settings FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_on_insert();


--
-- Name: message_templates trg_set_tenant_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_tenant_id BEFORE INSERT ON public.message_templates FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_on_insert();


--
-- Name: monthly_goals trg_set_tenant_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_tenant_id BEFORE INSERT ON public.monthly_goals FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_on_insert();


--
-- Name: push_subscriptions trg_set_tenant_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_tenant_id BEFORE INSERT ON public.push_subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_on_insert();


--
-- Name: queue trg_set_tenant_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_tenant_id BEFORE INSERT ON public.queue FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_on_insert();


--
-- Name: services trg_set_tenant_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_tenant_id BEFORE INSERT ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_on_insert();


--
-- Name: shop_settings trg_set_tenant_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_tenant_id BEFORE INSERT ON public.shop_settings FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_on_insert();


--
-- Name: shop_subscriptions trg_set_tenant_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_tenant_id BEFORE INSERT ON public.shop_subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_on_insert();


--
-- Name: site_analytics trg_set_tenant_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_tenant_id BEFORE INSERT ON public.site_analytics FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_on_insert();


--
-- Name: usage_metrics trg_set_tenant_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_tenant_id BEFORE INSERT ON public.usage_metrics FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_on_insert();


--
-- Name: user_profiles trg_set_tenant_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_tenant_id BEFORE INSERT ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_on_insert();


--
-- Name: webhook_configs trg_set_tenant_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_tenant_id BEFORE INSERT ON public.webhook_configs FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_on_insert();


--
-- Name: admin_settings trg_tenant_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_tenant_immutable BEFORE UPDATE ON public.admin_settings FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: appointments trg_tenant_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_tenant_immutable BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: barber_availability trg_tenant_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_tenant_immutable BEFORE UPDATE ON public.barber_availability FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: barber_leaves trg_tenant_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_tenant_immutable BEFORE UPDATE ON public.barber_leaves FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: barber_performance trg_tenant_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_tenant_immutable BEFORE UPDATE ON public.barber_performance FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: barber_schedules trg_tenant_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_tenant_immutable BEFORE UPDATE ON public.barber_schedules FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: barbers trg_tenant_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_tenant_immutable BEFORE UPDATE ON public.barbers FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: blocked_slots trg_tenant_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_tenant_immutable BEFORE UPDATE ON public.blocked_slots FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: chatpro_config trg_tenant_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_tenant_immutable BEFORE UPDATE ON public.chatpro_config FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: feedbacks trg_tenant_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_tenant_immutable BEFORE UPDATE ON public.feedbacks FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: marketing_campaigns trg_tenant_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_tenant_immutable BEFORE UPDATE ON public.marketing_campaigns FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: marketing_contacts trg_tenant_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_tenant_immutable BEFORE UPDATE ON public.marketing_contacts FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: marketing_settings trg_tenant_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_tenant_immutable BEFORE UPDATE ON public.marketing_settings FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: message_templates trg_tenant_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_tenant_immutable BEFORE UPDATE ON public.message_templates FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: monthly_goals trg_tenant_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_tenant_immutable BEFORE UPDATE ON public.monthly_goals FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: push_subscriptions trg_tenant_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_tenant_immutable BEFORE UPDATE ON public.push_subscriptions FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: queue trg_tenant_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_tenant_immutable BEFORE UPDATE ON public.queue FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: services trg_tenant_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_tenant_immutable BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: shop_settings trg_tenant_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_tenant_immutable BEFORE UPDATE ON public.shop_settings FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: shop_subscriptions trg_tenant_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_tenant_immutable BEFORE UPDATE ON public.shop_subscriptions FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: site_analytics trg_tenant_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_tenant_immutable BEFORE UPDATE ON public.site_analytics FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: usage_metrics trg_tenant_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_tenant_immutable BEFORE UPDATE ON public.usage_metrics FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: user_profiles trg_tenant_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_tenant_immutable BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: webhook_configs trg_tenant_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_tenant_immutable BEFORE UPDATE ON public.webhook_configs FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: admin_settings trg_validate_tenant; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_tenant BEFORE UPDATE ON public.admin_settings FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: appointments trg_validate_tenant; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_tenant BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: barber_availability trg_validate_tenant; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_tenant BEFORE UPDATE ON public.barber_availability FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: barber_leaves trg_validate_tenant; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_tenant BEFORE UPDATE ON public.barber_leaves FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: barber_performance trg_validate_tenant; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_tenant BEFORE UPDATE ON public.barber_performance FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: barber_schedules trg_validate_tenant; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_tenant BEFORE UPDATE ON public.barber_schedules FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: barbers trg_validate_tenant; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_tenant BEFORE UPDATE ON public.barbers FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: blocked_slots trg_validate_tenant; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_tenant BEFORE UPDATE ON public.blocked_slots FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: chatpro_config trg_validate_tenant; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_tenant BEFORE UPDATE ON public.chatpro_config FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: feedbacks trg_validate_tenant; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_tenant BEFORE UPDATE ON public.feedbacks FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: marketing_campaigns trg_validate_tenant; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_tenant BEFORE UPDATE ON public.marketing_campaigns FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: marketing_contacts trg_validate_tenant; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_tenant BEFORE UPDATE ON public.marketing_contacts FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: marketing_settings trg_validate_tenant; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_tenant BEFORE UPDATE ON public.marketing_settings FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: message_templates trg_validate_tenant; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_tenant BEFORE UPDATE ON public.message_templates FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: monthly_goals trg_validate_tenant; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_tenant BEFORE UPDATE ON public.monthly_goals FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: push_subscriptions trg_validate_tenant; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_tenant BEFORE UPDATE ON public.push_subscriptions FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: queue trg_validate_tenant; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_tenant BEFORE UPDATE ON public.queue FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: services trg_validate_tenant; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_tenant BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: shop_settings trg_validate_tenant; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_tenant BEFORE UPDATE ON public.shop_settings FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: shop_subscriptions trg_validate_tenant; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_tenant BEFORE UPDATE ON public.shop_subscriptions FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: site_analytics trg_validate_tenant; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_tenant BEFORE UPDATE ON public.site_analytics FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: usage_metrics trg_validate_tenant; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_tenant BEFORE UPDATE ON public.usage_metrics FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: user_profiles trg_validate_tenant; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_tenant BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: webhook_configs trg_validate_tenant; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_tenant BEFORE UPDATE ON public.webhook_configs FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable();


--
-- Name: whatsapp_conversation_states trg_wa_conv_states_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_wa_conv_states_updated BEFORE UPDATE ON public.whatsapp_conversation_states FOR EACH ROW EXECUTE FUNCTION public.update_wa_interactive_updated_at();


--
-- Name: whatsapp_interactive_templates trg_wa_interactive_templates_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_wa_interactive_templates_updated BEFORE UPDATE ON public.whatsapp_interactive_templates FOR EACH ROW EXECUTE FUNCTION public.update_wa_interactive_updated_at();


--
-- Name: affiliate_proposals trigger_calculate_proposal_commission; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_calculate_proposal_commission BEFORE UPDATE ON public.affiliate_proposals FOR EACH ROW EXECUTE FUNCTION public.calculate_proposal_commission();


--
-- Name: admin_settings update_admin_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON public.admin_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: admin_users update_admin_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: affiliate_proposals update_affiliate_proposals_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_affiliate_proposals_updated_at BEFORE UPDATE ON public.affiliate_proposals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: affiliates update_affiliates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_affiliates_updated_at BEFORE UPDATE ON public.affiliates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: appointments update_appointments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: barber_availability update_barber_availability_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_barber_availability_updated_at BEFORE UPDATE ON public.barber_availability FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: barber_leaves update_barber_leaves_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_barber_leaves_updated_at BEFORE UPDATE ON public.barber_leaves FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: barber_performance update_barber_performance_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_barber_performance_updated_at BEFORE UPDATE ON public.barber_performance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: barber_schedules update_barber_schedules_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_barber_schedules_updated_at BEFORE UPDATE ON public.barber_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: barbers update_barbers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_barbers_updated_at BEFORE UPDATE ON public.barbers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: chatpro_config update_chatpro_config_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_chatpro_config_updated_at BEFORE UPDATE ON public.chatpro_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: whatsapp_circuit_breaker update_circuit_breaker_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_circuit_breaker_updated_at BEFORE UPDATE ON public.whatsapp_circuit_breaker FOR EACH ROW EXECUTE FUNCTION public.update_circuit_breaker_timestamp();


--
-- Name: contact_leads update_contact_leads_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_contact_leads_updated_at BEFORE UPDATE ON public.contact_leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: email_templates update_email_templates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: feedbacks update_feedbacks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_feedbacks_updated_at BEFORE UPDATE ON public.feedbacks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: genesis_alert_rules update_genesis_alert_rules_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_genesis_alert_rules_updated_at BEFORE UPDATE ON public.genesis_alert_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: genesis_alerts update_genesis_alerts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_genesis_alerts_updated_at BEFORE UPDATE ON public.genesis_alerts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: genesis_credits update_genesis_credits_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_genesis_credits_updated_at BEFORE UPDATE ON public.genesis_credits FOR EACH ROW EXECUTE FUNCTION public.update_genesis_updated_at();


--
-- Name: genesis_instances update_genesis_instances_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_genesis_instances_updated_at BEFORE UPDATE ON public.genesis_instances FOR EACH ROW EXECUTE FUNCTION public.update_genesis_updated_at();


--
-- Name: genesis_subscriptions update_genesis_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_genesis_subscriptions_updated_at BEFORE UPDATE ON public.genesis_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_genesis_updated_at();


--
-- Name: genesis_users update_genesis_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_genesis_users_updated_at BEFORE UPDATE ON public.genesis_users FOR EACH ROW EXECUTE FUNCTION public.update_genesis_updated_at();


--
-- Name: marketing_campaigns update_marketing_campaigns_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_marketing_campaigns_updated_at BEFORE UPDATE ON public.marketing_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: marketing_settings update_marketing_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_marketing_settings_updated_at BEFORE UPDATE ON public.marketing_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: affiliate_materials update_materials_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON public.affiliate_materials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: message_templates update_message_templates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_message_templates_updated_at BEFORE UPDATE ON public.message_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: monthly_goals update_monthly_goals_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_monthly_goals_updated_at BEFORE UPDATE ON public.monthly_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: owner_github_config update_owner_github_config_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_owner_github_config_updated_at BEFORE UPDATE ON public.owner_github_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: owner_settings update_owner_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_owner_settings_updated_at BEFORE UPDATE ON public.owner_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: affiliate_referrals update_referrals_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON public.affiliate_referrals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: services update_services_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: shop_settings update_shop_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_shop_settings_updated_at BEFORE UPDATE ON public.shop_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: shop_subscriptions update_shop_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_shop_subscriptions_updated_at BEFORE UPDATE ON public.shop_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subscription_plans update_subscription_plans_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: usage_metrics update_usage_metrics_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_usage_metrics_updated_at BEFORE UPDATE ON public.usage_metrics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_profiles update_user_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: webhook_configs update_webhook_configs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_webhook_configs_updated_at BEFORE UPDATE ON public.webhook_configs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: whatsapp_api_projects update_whatsapp_api_projects_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_whatsapp_api_projects_updated_at BEFORE UPDATE ON public.whatsapp_api_projects FOR EACH ROW EXECUTE FUNCTION public.update_whatsapp_api_updated_at();


--
-- Name: whatsapp_automation_rules update_whatsapp_automation_rules_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_whatsapp_automation_rules_updated_at BEFORE UPDATE ON public.whatsapp_automation_rules FOR EACH ROW EXECUTE FUNCTION public.update_whatsapp_api_updated_at();


--
-- Name: whatsapp_automation_templates update_whatsapp_automation_templates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_whatsapp_automation_templates_updated_at BEFORE UPDATE ON public.whatsapp_automation_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: whatsapp_backend_config update_whatsapp_backend_config_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_whatsapp_backend_config_updated_at BEFORE UPDATE ON public.whatsapp_backend_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: whatsapp_external_webhooks update_whatsapp_external_webhooks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_whatsapp_external_webhooks_updated_at BEFORE UPDATE ON public.whatsapp_external_webhooks FOR EACH ROW EXECUTE FUNCTION public.update_whatsapp_api_updated_at();


--
-- Name: whatsapp_instances update_whatsapp_instances_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_whatsapp_instances_updated_at BEFORE UPDATE ON public.whatsapp_instances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: whatsapp_templates update_whatsapp_templates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_whatsapp_templates_updated_at BEFORE UPDATE ON public.whatsapp_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: admin_settings admin_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_settings
    ADD CONSTRAINT admin_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: admin_users admin_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: affiliate_clicks affiliate_clicks_affiliate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_clicks
    ADD CONSTRAINT affiliate_clicks_affiliate_id_fkey FOREIGN KEY (affiliate_id) REFERENCES public.affiliates(id) ON DELETE CASCADE;


--
-- Name: affiliate_proposals affiliate_proposals_affiliate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_proposals
    ADD CONSTRAINT affiliate_proposals_affiliate_id_fkey FOREIGN KEY (affiliate_id) REFERENCES public.affiliates(id) ON DELETE CASCADE;


--
-- Name: affiliate_proposals affiliate_proposals_niche_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_proposals
    ADD CONSTRAINT affiliate_proposals_niche_id_fkey FOREIGN KEY (niche_id) REFERENCES public.business_niches(id);


--
-- Name: affiliate_referrals affiliate_referrals_affiliate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_referrals
    ADD CONSTRAINT affiliate_referrals_affiliate_id_fkey FOREIGN KEY (affiliate_id) REFERENCES public.affiliates(id) ON DELETE CASCADE;


--
-- Name: affiliate_referrals affiliate_referrals_referred_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_referrals
    ADD CONSTRAINT affiliate_referrals_referred_user_id_fkey FOREIGN KEY (referred_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: affiliate_withdrawals affiliate_withdrawals_affiliate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_withdrawals
    ADD CONSTRAINT affiliate_withdrawals_affiliate_id_fkey FOREIGN KEY (affiliate_id) REFERENCES public.affiliates(id) ON DELETE CASCADE;


--
-- Name: affiliate_withdrawals affiliate_withdrawals_processed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_withdrawals
    ADD CONSTRAINT affiliate_withdrawals_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES auth.users(id);


--
-- Name: affiliates affiliates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliates
    ADD CONSTRAINT affiliates_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: affiliates affiliates_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliates
    ADD CONSTRAINT affiliates_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_barber_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_barber_id_fkey FOREIGN KEY (barber_id) REFERENCES public.barbers(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: barber_availability barber_availability_barber_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.barber_availability
    ADD CONSTRAINT barber_availability_barber_id_fkey FOREIGN KEY (barber_id) REFERENCES public.barbers(id) ON DELETE CASCADE;


--
-- Name: barber_availability barber_availability_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.barber_availability
    ADD CONSTRAINT barber_availability_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: barber_leaves barber_leaves_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.barber_leaves
    ADD CONSTRAINT barber_leaves_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES auth.users(id);


--
-- Name: barber_leaves barber_leaves_barber_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.barber_leaves
    ADD CONSTRAINT barber_leaves_barber_id_fkey FOREIGN KEY (barber_id) REFERENCES public.barbers(id) ON DELETE CASCADE;


--
-- Name: barber_leaves barber_leaves_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.barber_leaves
    ADD CONSTRAINT barber_leaves_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: barber_performance barber_performance_barber_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.barber_performance
    ADD CONSTRAINT barber_performance_barber_id_fkey FOREIGN KEY (barber_id) REFERENCES public.barbers(id) ON DELETE CASCADE;


--
-- Name: barber_performance barber_performance_most_popular_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.barber_performance
    ADD CONSTRAINT barber_performance_most_popular_service_id_fkey FOREIGN KEY (most_popular_service_id) REFERENCES public.services(id);


--
-- Name: barber_performance barber_performance_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.barber_performance
    ADD CONSTRAINT barber_performance_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: barber_schedules barber_schedules_barber_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.barber_schedules
    ADD CONSTRAINT barber_schedules_barber_id_fkey FOREIGN KEY (barber_id) REFERENCES public.barbers(id) ON DELETE CASCADE;


--
-- Name: barber_schedules barber_schedules_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.barber_schedules
    ADD CONSTRAINT barber_schedules_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: barbers barbers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.barbers
    ADD CONSTRAINT barbers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: blocked_slots blocked_slots_barber_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocked_slots
    ADD CONSTRAINT blocked_slots_barber_id_fkey FOREIGN KEY (barber_id) REFERENCES public.barbers(id) ON DELETE CASCADE;


--
-- Name: blocked_slots blocked_slots_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocked_slots
    ADD CONSTRAINT blocked_slots_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: chatpro_config chatpro_config_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chatpro_config
    ADD CONSTRAINT chatpro_config_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: crm_audit_logs crm_audit_logs_crm_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_audit_logs
    ADD CONSTRAINT crm_audit_logs_crm_tenant_id_fkey FOREIGN KEY (crm_tenant_id) REFERENCES public.crm_tenants(id) ON DELETE CASCADE;


--
-- Name: crm_audit_logs crm_audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_audit_logs
    ADD CONSTRAINT crm_audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.crm_users(id);


--
-- Name: crm_collaborator_tokens crm_collaborator_tokens_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_collaborator_tokens
    ADD CONSTRAINT crm_collaborator_tokens_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.crm_users(id);


--
-- Name: crm_collaborator_tokens crm_collaborator_tokens_crm_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_collaborator_tokens
    ADD CONSTRAINT crm_collaborator_tokens_crm_tenant_id_fkey FOREIGN KEY (crm_tenant_id) REFERENCES public.crm_tenants(id) ON DELETE CASCADE;


--
-- Name: crm_custom_fields crm_custom_fields_crm_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_custom_fields
    ADD CONSTRAINT crm_custom_fields_crm_tenant_id_fkey FOREIGN KEY (crm_tenant_id) REFERENCES public.crm_tenants(id) ON DELETE CASCADE;


--
-- Name: crm_funnel_stages crm_funnel_stages_crm_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_funnel_stages
    ADD CONSTRAINT crm_funnel_stages_crm_tenant_id_fkey FOREIGN KEY (crm_tenant_id) REFERENCES public.crm_tenants(id) ON DELETE CASCADE;


--
-- Name: crm_funnel_stages crm_funnel_stages_funnel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_funnel_stages
    ADD CONSTRAINT crm_funnel_stages_funnel_id_fkey FOREIGN KEY (funnel_id) REFERENCES public.crm_funnels(id) ON DELETE CASCADE;


--
-- Name: crm_funnels crm_funnels_crm_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_funnels
    ADD CONSTRAINT crm_funnels_crm_tenant_id_fkey FOREIGN KEY (crm_tenant_id) REFERENCES public.crm_tenants(id) ON DELETE CASCADE;


--
-- Name: crm_funnels crm_funnels_pipeline_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_funnels
    ADD CONSTRAINT crm_funnels_pipeline_id_fkey FOREIGN KEY (pipeline_id) REFERENCES public.crm_pipelines(id) ON DELETE SET NULL;


--
-- Name: crm_lead_history crm_lead_history_crm_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_lead_history
    ADD CONSTRAINT crm_lead_history_crm_tenant_id_fkey FOREIGN KEY (crm_tenant_id) REFERENCES public.crm_tenants(id) ON DELETE CASCADE;


--
-- Name: crm_lead_history crm_lead_history_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_lead_history
    ADD CONSTRAINT crm_lead_history_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.crm_leads(id) ON DELETE CASCADE;


--
-- Name: crm_lead_history crm_lead_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_lead_history
    ADD CONSTRAINT crm_lead_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.crm_users(id);


--
-- Name: crm_lead_tags crm_lead_tags_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_lead_tags
    ADD CONSTRAINT crm_lead_tags_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.crm_leads(id) ON DELETE CASCADE;


--
-- Name: crm_lead_tags crm_lead_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_lead_tags
    ADD CONSTRAINT crm_lead_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.crm_tags(id) ON DELETE CASCADE;


--
-- Name: crm_leads crm_leads_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_leads
    ADD CONSTRAINT crm_leads_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.crm_users(id);


--
-- Name: crm_leads crm_leads_crm_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_leads
    ADD CONSTRAINT crm_leads_crm_tenant_id_fkey FOREIGN KEY (crm_tenant_id) REFERENCES public.crm_tenants(id) ON DELETE CASCADE;


--
-- Name: crm_leads crm_leads_funnel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_leads
    ADD CONSTRAINT crm_leads_funnel_id_fkey FOREIGN KEY (funnel_id) REFERENCES public.crm_funnels(id) ON DELETE SET NULL;


--
-- Name: crm_leads crm_leads_loss_reason_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_leads
    ADD CONSTRAINT crm_leads_loss_reason_id_fkey FOREIGN KEY (loss_reason_id) REFERENCES public.crm_loss_reasons(id);


--
-- Name: crm_leads crm_leads_pipeline_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_leads
    ADD CONSTRAINT crm_leads_pipeline_id_fkey FOREIGN KEY (pipeline_id) REFERENCES public.crm_pipelines(id) ON DELETE SET NULL;


--
-- Name: crm_leads crm_leads_responsible_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_leads
    ADD CONSTRAINT crm_leads_responsible_id_fkey FOREIGN KEY (responsible_id) REFERENCES public.crm_users(id) ON DELETE SET NULL;


--
-- Name: crm_leads crm_leads_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_leads
    ADD CONSTRAINT crm_leads_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.crm_funnel_stages(id) ON DELETE SET NULL;


--
-- Name: crm_loss_reasons crm_loss_reasons_crm_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_loss_reasons
    ADD CONSTRAINT crm_loss_reasons_crm_tenant_id_fkey FOREIGN KEY (crm_tenant_id) REFERENCES public.crm_tenants(id) ON DELETE CASCADE;


--
-- Name: crm_notifications crm_notifications_crm_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_notifications
    ADD CONSTRAINT crm_notifications_crm_tenant_id_fkey FOREIGN KEY (crm_tenant_id) REFERENCES public.crm_tenants(id) ON DELETE CASCADE;


--
-- Name: crm_notifications crm_notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_notifications
    ADD CONSTRAINT crm_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.crm_users(id) ON DELETE CASCADE;


--
-- Name: crm_pipelines crm_pipelines_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_pipelines
    ADD CONSTRAINT crm_pipelines_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.crm_users(id);


--
-- Name: crm_pipelines crm_pipelines_crm_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_pipelines
    ADD CONSTRAINT crm_pipelines_crm_tenant_id_fkey FOREIGN KEY (crm_tenant_id) REFERENCES public.crm_tenants(id) ON DELETE CASCADE;


--
-- Name: crm_tags crm_tags_crm_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_tags
    ADD CONSTRAINT crm_tags_crm_tenant_id_fkey FOREIGN KEY (crm_tenant_id) REFERENCES public.crm_tenants(id) ON DELETE CASCADE;


--
-- Name: crm_tasks crm_tasks_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_tasks
    ADD CONSTRAINT crm_tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.crm_users(id) ON DELETE SET NULL;


--
-- Name: crm_tasks crm_tasks_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_tasks
    ADD CONSTRAINT crm_tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.crm_users(id);


--
-- Name: crm_tasks crm_tasks_crm_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_tasks
    ADD CONSTRAINT crm_tasks_crm_tenant_id_fkey FOREIGN KEY (crm_tenant_id) REFERENCES public.crm_tenants(id) ON DELETE CASCADE;


--
-- Name: crm_tasks crm_tasks_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_tasks
    ADD CONSTRAINT crm_tasks_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.crm_leads(id) ON DELETE CASCADE;


--
-- Name: crm_users crm_users_crm_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_users
    ADD CONSTRAINT crm_users_crm_tenant_id_fkey FOREIGN KEY (crm_tenant_id) REFERENCES public.crm_tenants(id) ON DELETE CASCADE;


--
-- Name: feedbacks feedbacks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedbacks
    ADD CONSTRAINT feedbacks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: flow_execution_context flow_execution_context_flow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flow_execution_context
    ADD CONSTRAINT flow_execution_context_flow_id_fkey FOREIGN KEY (flow_id) REFERENCES public.whatsapp_automation_rules(id) ON DELETE CASCADE;


--
-- Name: flow_execution_history flow_execution_history_flow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flow_execution_history
    ADD CONSTRAINT flow_execution_history_flow_id_fkey FOREIGN KEY (flow_id) REFERENCES public.whatsapp_automation_rules(id) ON DELETE CASCADE;


--
-- Name: flow_node_executions flow_node_executions_flow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flow_node_executions
    ADD CONSTRAINT flow_node_executions_flow_id_fkey FOREIGN KEY (flow_id) REFERENCES public.whatsapp_automation_rules(id) ON DELETE CASCADE;


--
-- Name: fraud_protection fraud_protection_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fraud_protection
    ADD CONSTRAINT fraud_protection_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: genesis_alert_rules genesis_alert_rules_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_alert_rules
    ADD CONSTRAINT genesis_alert_rules_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.genesis_instances(id) ON DELETE CASCADE;


--
-- Name: genesis_alerts genesis_alerts_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_alerts
    ADD CONSTRAINT genesis_alerts_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.genesis_instances(id) ON DELETE CASCADE;


--
-- Name: genesis_alerts genesis_alerts_vps_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_alerts
    ADD CONSTRAINT genesis_alerts_vps_node_id_fkey FOREIGN KEY (vps_node_id) REFERENCES public.genesis_vps_nodes(id) ON DELETE CASCADE;


--
-- Name: genesis_credit_transactions genesis_credit_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_credit_transactions
    ADD CONSTRAINT genesis_credit_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.genesis_users(id) ON DELETE CASCADE;


--
-- Name: genesis_credit_usage genesis_credit_usage_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_credit_usage
    ADD CONSTRAINT genesis_credit_usage_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.genesis_instances(id) ON DELETE SET NULL;


--
-- Name: genesis_credit_usage genesis_credit_usage_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_credit_usage
    ADD CONSTRAINT genesis_credit_usage_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.genesis_users(id) ON DELETE CASCADE;


--
-- Name: genesis_credits genesis_credits_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_credits
    ADD CONSTRAINT genesis_credits_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.genesis_users(id) ON DELETE CASCADE;


--
-- Name: genesis_event_logs genesis_event_logs_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_event_logs
    ADD CONSTRAINT genesis_event_logs_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.genesis_instances(id) ON DELETE CASCADE;


--
-- Name: genesis_event_logs genesis_event_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_event_logs
    ADD CONSTRAINT genesis_event_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.genesis_users(id) ON DELETE CASCADE;


--
-- Name: genesis_instance_events genesis_instance_events_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_instance_events
    ADD CONSTRAINT genesis_instance_events_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.genesis_instances(id) ON DELETE CASCADE;


--
-- Name: genesis_instance_failovers genesis_instance_failovers_backup_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_instance_failovers
    ADD CONSTRAINT genesis_instance_failovers_backup_id_fkey FOREIGN KEY (backup_id) REFERENCES public.genesis_session_backups(id);


--
-- Name: genesis_instance_failovers genesis_instance_failovers_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_instance_failovers
    ADD CONSTRAINT genesis_instance_failovers_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.genesis_instances(id) ON DELETE CASCADE;


--
-- Name: genesis_instance_failovers genesis_instance_failovers_source_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_instance_failovers
    ADD CONSTRAINT genesis_instance_failovers_source_node_id_fkey FOREIGN KEY (source_node_id) REFERENCES public.genesis_vps_nodes(id);


--
-- Name: genesis_instance_failovers genesis_instance_failovers_target_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_instance_failovers
    ADD CONSTRAINT genesis_instance_failovers_target_node_id_fkey FOREIGN KEY (target_node_id) REFERENCES public.genesis_vps_nodes(id);


--
-- Name: genesis_instance_metrics genesis_instance_metrics_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_instance_metrics
    ADD CONSTRAINT genesis_instance_metrics_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.genesis_instances(id) ON DELETE CASCADE;


--
-- Name: genesis_instance_tokens genesis_instance_tokens_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_instance_tokens
    ADD CONSTRAINT genesis_instance_tokens_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.genesis_instances(id) ON DELETE CASCADE;


--
-- Name: genesis_instances genesis_instances_last_backup_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_instances
    ADD CONSTRAINT genesis_instances_last_backup_id_fkey FOREIGN KEY (last_backup_id) REFERENCES public.genesis_session_backups(id);


--
-- Name: genesis_instances genesis_instances_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_instances
    ADD CONSTRAINT genesis_instances_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.genesis_users(id) ON DELETE CASCADE;


--
-- Name: genesis_instances genesis_instances_vps_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_instances
    ADD CONSTRAINT genesis_instances_vps_node_id_fkey FOREIGN KEY (vps_node_id) REFERENCES public.genesis_vps_nodes(id);


--
-- Name: genesis_realtime_metrics genesis_realtime_metrics_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_realtime_metrics
    ADD CONSTRAINT genesis_realtime_metrics_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.genesis_instances(id) ON DELETE CASCADE;


--
-- Name: genesis_session_backups genesis_session_backups_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_session_backups
    ADD CONSTRAINT genesis_session_backups_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.genesis_instances(id) ON DELETE CASCADE;


--
-- Name: genesis_session_backups genesis_session_backups_restored_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_session_backups
    ADD CONSTRAINT genesis_session_backups_restored_by_fkey FOREIGN KEY (restored_by) REFERENCES auth.users(id);


--
-- Name: genesis_subscriptions genesis_subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_subscriptions
    ADD CONSTRAINT genesis_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.genesis_users(id) ON DELETE CASCADE;


--
-- Name: genesis_user_roles genesis_user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_user_roles
    ADD CONSTRAINT genesis_user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.genesis_users(id) ON DELETE CASCADE;


--
-- Name: genesis_users genesis_users_auth_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_users
    ADD CONSTRAINT genesis_users_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: genesis_webhook_configs genesis_webhook_configs_flow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_webhook_configs
    ADD CONSTRAINT genesis_webhook_configs_flow_id_fkey FOREIGN KEY (flow_id) REFERENCES public.whatsapp_automation_rules(id) ON DELETE SET NULL;


--
-- Name: genesis_webhook_configs genesis_webhook_configs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_webhook_configs
    ADD CONSTRAINT genesis_webhook_configs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.genesis_users(id) ON DELETE CASCADE;


--
-- Name: genesis_webhook_dead_letters genesis_webhook_dead_letters_webhook_config_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_webhook_dead_letters
    ADD CONSTRAINT genesis_webhook_dead_letters_webhook_config_id_fkey FOREIGN KEY (webhook_config_id) REFERENCES public.genesis_webhook_configs(id) ON DELETE CASCADE;


--
-- Name: genesis_webhook_dead_letters genesis_webhook_dead_letters_webhook_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_webhook_dead_letters
    ADD CONSTRAINT genesis_webhook_dead_letters_webhook_event_id_fkey FOREIGN KEY (webhook_event_id) REFERENCES public.genesis_webhook_events(id) ON DELETE CASCADE;


--
-- Name: genesis_webhook_events genesis_webhook_events_webhook_config_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_webhook_events
    ADD CONSTRAINT genesis_webhook_events_webhook_config_id_fkey FOREIGN KEY (webhook_config_id) REFERENCES public.genesis_webhook_configs(id) ON DELETE CASCADE;


--
-- Name: genesis_webhook_rate_limits genesis_webhook_rate_limits_webhook_config_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_webhook_rate_limits
    ADD CONSTRAINT genesis_webhook_rate_limits_webhook_config_id_fkey FOREIGN KEY (webhook_config_id) REFERENCES public.genesis_webhook_configs(id) ON DELETE CASCADE;


--
-- Name: genesis_webhooks genesis_webhooks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genesis_webhooks
    ADD CONSTRAINT genesis_webhooks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.genesis_users(id) ON DELETE CASCADE;


--
-- Name: marketing_campaigns marketing_campaigns_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketing_campaigns
    ADD CONSTRAINT marketing_campaigns_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: marketing_contacts marketing_contacts_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketing_contacts
    ADD CONSTRAINT marketing_contacts_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE;


--
-- Name: marketing_contacts marketing_contacts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketing_contacts
    ADD CONSTRAINT marketing_contacts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: marketing_settings marketing_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketing_settings
    ADD CONSTRAINT marketing_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: message_templates message_templates_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_templates
    ADD CONSTRAINT message_templates_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: monthly_goals monthly_goals_barber_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monthly_goals
    ADD CONSTRAINT monthly_goals_barber_id_fkey FOREIGN KEY (barber_id) REFERENCES public.barbers(id) ON DELETE CASCADE;


--
-- Name: monthly_goals monthly_goals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monthly_goals
    ADD CONSTRAINT monthly_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: proposal_questionnaire_history proposal_questionnaire_history_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_questionnaire_history
    ADD CONSTRAINT proposal_questionnaire_history_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.affiliate_proposals(id) ON DELETE CASCADE;


--
-- Name: queue queue_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.queue
    ADD CONSTRAINT queue_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;


--
-- Name: queue queue_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.queue
    ADD CONSTRAINT queue_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: services services_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: shop_settings shop_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_settings
    ADD CONSTRAINT shop_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: shop_subscriptions shop_subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_subscriptions
    ADD CONSTRAINT shop_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id);


--
-- Name: shop_subscriptions shop_subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_subscriptions
    ADD CONSTRAINT shop_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: site_analytics site_analytics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_analytics
    ADD CONSTRAINT site_analytics_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: usage_metrics usage_metrics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_metrics
    ADD CONSTRAINT usage_metrics_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_tenants user_tenants_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tenants
    ADD CONSTRAINT user_tenants_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: user_tenants user_tenants_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tenants
    ADD CONSTRAINT user_tenants_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: webhook_configs webhook_configs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_configs
    ADD CONSTRAINT webhook_configs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: whatsapp_alerts whatsapp_alerts_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_alerts
    ADD CONSTRAINT whatsapp_alerts_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE;


--
-- Name: whatsapp_api_keys whatsapp_api_keys_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_api_keys
    ADD CONSTRAINT whatsapp_api_keys_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE;


--
-- Name: whatsapp_api_logs whatsapp_api_logs_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_api_logs
    ADD CONSTRAINT whatsapp_api_logs_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.whatsapp_api_projects(id) ON DELETE SET NULL;


--
-- Name: whatsapp_audit_logs whatsapp_audit_logs_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_audit_logs
    ADD CONSTRAINT whatsapp_audit_logs_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.whatsapp_instances(id) ON DELETE SET NULL;


--
-- Name: whatsapp_automation_rules whatsapp_automation_rules_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_automation_rules
    ADD CONSTRAINT whatsapp_automation_rules_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.genesis_instances(id) ON DELETE CASCADE;


--
-- Name: whatsapp_automation_rules whatsapp_automation_rules_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_automation_rules
    ADD CONSTRAINT whatsapp_automation_rules_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.whatsapp_api_projects(id) ON DELETE CASCADE;


--
-- Name: whatsapp_automation_rules whatsapp_automation_rules_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_automation_rules
    ADD CONSTRAINT whatsapp_automation_rules_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.genesis_users(id) ON DELETE CASCADE;


--
-- Name: whatsapp_automations whatsapp_automations_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_automations
    ADD CONSTRAINT whatsapp_automations_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.whatsapp_instances(id) ON DELETE SET NULL;


--
-- Name: whatsapp_automations whatsapp_automations_next_automation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_automations
    ADD CONSTRAINT whatsapp_automations_next_automation_id_fkey FOREIGN KEY (next_automation_id) REFERENCES public.whatsapp_automations(id);


--
-- Name: whatsapp_away_messages whatsapp_away_messages_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_away_messages
    ADD CONSTRAINT whatsapp_away_messages_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE;


--
-- Name: whatsapp_business_hours whatsapp_business_hours_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_business_hours
    ADD CONSTRAINT whatsapp_business_hours_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE;


--
-- Name: whatsapp_button_actions whatsapp_button_actions_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_button_actions
    ADD CONSTRAINT whatsapp_button_actions_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.whatsapp_interactive_templates(id) ON DELETE CASCADE;


--
-- Name: whatsapp_button_clicks whatsapp_button_clicks_conversation_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_button_clicks
    ADD CONSTRAINT whatsapp_button_clicks_conversation_state_id_fkey FOREIGN KEY (conversation_state_id) REFERENCES public.whatsapp_conversation_states(id) ON DELETE SET NULL;


--
-- Name: whatsapp_button_clicks whatsapp_button_clicks_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_button_clicks
    ADD CONSTRAINT whatsapp_button_clicks_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE;


--
-- Name: whatsapp_button_clicks whatsapp_button_clicks_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_button_clicks
    ADD CONSTRAINT whatsapp_button_clicks_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.whatsapp_interactive_templates(id) ON DELETE SET NULL;


--
-- Name: whatsapp_circuit_breaker whatsapp_circuit_breaker_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_circuit_breaker
    ADD CONSTRAINT whatsapp_circuit_breaker_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE;


--
-- Name: whatsapp_contacts whatsapp_contacts_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_contacts
    ADD CONSTRAINT whatsapp_contacts_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE;


--
-- Name: whatsapp_conversation_states whatsapp_conversation_states_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_conversation_states
    ADD CONSTRAINT whatsapp_conversation_states_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE;


--
-- Name: whatsapp_conversation_states whatsapp_conversation_states_last_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_conversation_states
    ADD CONSTRAINT whatsapp_conversation_states_last_template_id_fkey FOREIGN KEY (last_template_id) REFERENCES public.whatsapp_interactive_templates(id);


--
-- Name: whatsapp_conversations whatsapp_conversations_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_conversations
    ADD CONSTRAINT whatsapp_conversations_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE;


--
-- Name: whatsapp_event_queue whatsapp_event_queue_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_event_queue
    ADD CONSTRAINT whatsapp_event_queue_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.whatsapp_api_projects(id) ON DELETE SET NULL;


--
-- Name: whatsapp_external_webhooks whatsapp_external_webhooks_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_external_webhooks
    ADD CONSTRAINT whatsapp_external_webhooks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.whatsapp_api_projects(id) ON DELETE CASCADE;


--
-- Name: whatsapp_flow_edges whatsapp_flow_edges_rule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_flow_edges
    ADD CONSTRAINT whatsapp_flow_edges_rule_id_fkey FOREIGN KEY (rule_id) REFERENCES public.whatsapp_automation_rules(id) ON DELETE CASCADE;


--
-- Name: whatsapp_flow_nodes whatsapp_flow_nodes_rule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_flow_nodes
    ADD CONSTRAINT whatsapp_flow_nodes_rule_id_fkey FOREIGN KEY (rule_id) REFERENCES public.whatsapp_automation_rules(id) ON DELETE CASCADE;


--
-- Name: whatsapp_group_participants whatsapp_group_participants_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_group_participants
    ADD CONSTRAINT whatsapp_group_participants_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.whatsapp_groups(id) ON DELETE CASCADE;


--
-- Name: whatsapp_groups whatsapp_groups_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_groups
    ADD CONSTRAINT whatsapp_groups_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE;


--
-- Name: whatsapp_health_checks whatsapp_health_checks_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_health_checks
    ADD CONSTRAINT whatsapp_health_checks_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE;


--
-- Name: whatsapp_inbox whatsapp_inbox_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_inbox
    ADD CONSTRAINT whatsapp_inbox_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE;


--
-- Name: whatsapp_inbox whatsapp_inbox_replied_to_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_inbox
    ADD CONSTRAINT whatsapp_inbox_replied_to_id_fkey FOREIGN KEY (replied_to_id) REFERENCES public.whatsapp_inbox(id);


--
-- Name: whatsapp_message_logs whatsapp_message_logs_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_message_logs
    ADD CONSTRAINT whatsapp_message_logs_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE;


--
-- Name: whatsapp_metrics whatsapp_metrics_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_metrics
    ADD CONSTRAINT whatsapp_metrics_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE;


--
-- Name: whatsapp_project_instances whatsapp_project_instances_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_project_instances
    ADD CONSTRAINT whatsapp_project_instances_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE;


--
-- Name: whatsapp_project_instances whatsapp_project_instances_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_project_instances
    ADD CONSTRAINT whatsapp_project_instances_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.whatsapp_api_projects(id) ON DELETE CASCADE;


--
-- Name: whatsapp_quick_replies whatsapp_quick_replies_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_quick_replies
    ADD CONSTRAINT whatsapp_quick_replies_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE;


--
-- Name: whatsapp_rate_limits whatsapp_rate_limits_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_rate_limits
    ADD CONSTRAINT whatsapp_rate_limits_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.whatsapp_api_projects(id) ON DELETE CASCADE;


--
-- Name: whatsapp_scheduled_messages whatsapp_scheduled_messages_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_scheduled_messages
    ADD CONSTRAINT whatsapp_scheduled_messages_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE;


--
-- Name: whatsapp_security_settings whatsapp_security_settings_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_security_settings
    ADD CONSTRAINT whatsapp_security_settings_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE;


--
-- Name: whatsapp_send_queue whatsapp_send_queue_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_send_queue
    ADD CONSTRAINT whatsapp_send_queue_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE;


--
-- Name: whatsapp_stability_logs whatsapp_stability_logs_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_stability_logs
    ADD CONSTRAINT whatsapp_stability_logs_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE;


--
-- Name: whatsapp_template_sends whatsapp_template_sends_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_template_sends
    ADD CONSTRAINT whatsapp_template_sends_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE;


--
-- Name: whatsapp_template_sends whatsapp_template_sends_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_template_sends
    ADD CONSTRAINT whatsapp_template_sends_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.whatsapp_interactive_templates(id) ON DELETE SET NULL;


--
-- Name: whatsapp_webhook_logs whatsapp_webhook_logs_webhook_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_webhook_logs
    ADD CONSTRAINT whatsapp_webhook_logs_webhook_id_fkey FOREIGN KEY (webhook_id) REFERENCES public.whatsapp_webhooks(id) ON DELETE CASCADE;


--
-- Name: whatsapp_webhooks whatsapp_webhooks_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_webhooks
    ADD CONSTRAINT whatsapp_webhooks_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE;


--
-- Name: audit_logs Admins can insert audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['super_admin'::public.app_role, 'admin'::public.app_role]))))));


--
-- Name: admin_users Admins can view admin users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view admin users" ON public.admin_users FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));


--
-- Name: user_roles Admins can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));


--
-- Name: audit_logs Admins can view audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['super_admin'::public.app_role, 'admin'::public.app_role]))))));


--
-- Name: login_attempts Admins can view login attempts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view login attempts" ON public.login_attempts FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));


--
-- Name: affiliate_proposals Affiliates can create own proposals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Affiliates can create own proposals" ON public.affiliate_proposals FOR INSERT WITH CHECK ((affiliate_id = public.get_affiliate_id(auth.uid())));


--
-- Name: affiliate_proposals Affiliates can delete own draft proposals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Affiliates can delete own draft proposals" ON public.affiliate_proposals FOR DELETE USING (((affiliate_id = public.get_affiliate_id(auth.uid())) AND (status = 'draft'::public.proposal_status)));


--
-- Name: proposal_questionnaire_history Affiliates can manage own questionnaire history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Affiliates can manage own questionnaire history" ON public.proposal_questionnaire_history USING ((EXISTS ( SELECT 1
   FROM public.affiliate_proposals p
  WHERE ((p.id = proposal_questionnaire_history.proposal_id) AND (p.affiliate_id = public.get_affiliate_id(auth.uid())))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.affiliate_proposals p
  WHERE ((p.id = proposal_questionnaire_history.proposal_id) AND (p.affiliate_id = public.get_affiliate_id(auth.uid()))))));


--
-- Name: affiliate_withdrawals Affiliates can request withdrawals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Affiliates can request withdrawals" ON public.affiliate_withdrawals FOR INSERT WITH CHECK ((affiliate_id = public.get_affiliate_id(auth.uid())));


--
-- Name: affiliate_proposals Affiliates can update own proposals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Affiliates can update own proposals" ON public.affiliate_proposals FOR UPDATE USING ((affiliate_id = public.get_affiliate_id(auth.uid())));


--
-- Name: affiliate_materials Affiliates can view active materials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Affiliates can view active materials" ON public.affiliate_materials FOR SELECT USING (((is_active = true) AND public.is_affiliate(auth.uid())));


--
-- Name: affiliate_clicks Affiliates can view own clicks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Affiliates can view own clicks" ON public.affiliate_clicks FOR SELECT USING ((affiliate_id = public.get_affiliate_id(auth.uid())));


--
-- Name: affiliates Affiliates can view own data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Affiliates can view own data" ON public.affiliates FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: affiliate_proposals Affiliates can view own proposals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Affiliates can view own proposals" ON public.affiliate_proposals FOR SELECT USING ((affiliate_id = public.get_affiliate_id(auth.uid())));


--
-- Name: affiliate_referrals Affiliates can view own referrals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Affiliates can view own referrals" ON public.affiliate_referrals FOR SELECT USING ((affiliate_id = public.get_affiliate_id(auth.uid())));


--
-- Name: affiliate_withdrawals Affiliates can view own withdrawals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Affiliates can view own withdrawals" ON public.affiliate_withdrawals FOR SELECT USING ((affiliate_id = public.get_affiliate_id(auth.uid())));


--
-- Name: genesis_users Allow insert during registration; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow insert during registration" ON public.genesis_users FOR INSERT WITH CHECK ((auth_user_id = auth.uid()));


--
-- Name: genesis_credits Allow insert own credits during registration; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow insert own credits during registration" ON public.genesis_credits FOR INSERT WITH CHECK ((user_id IN ( SELECT genesis_users.id
   FROM public.genesis_users
  WHERE (genesis_users.auth_user_id = auth.uid()))));


--
-- Name: genesis_user_roles Allow insert own role during registration; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow insert own role during registration" ON public.genesis_user_roles FOR INSERT WITH CHECK ((user_id IN ( SELECT genesis_users.id
   FROM public.genesis_users
  WHERE (genesis_users.auth_user_id = auth.uid()))));


--
-- Name: genesis_subscriptions Allow insert own subscription during registration; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow insert own subscription during registration" ON public.genesis_subscriptions FOR INSERT WITH CHECK ((user_id IN ( SELECT genesis_users.id
   FROM public.genesis_users
  WHERE (genesis_users.auth_user_id = auth.uid()))));


--
-- Name: whatsapp_api_logs Anyone can insert api logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert api logs" ON public.whatsapp_api_logs FOR INSERT WITH CHECK (true);


--
-- Name: affiliate_clicks Anyone can insert clicks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert clicks" ON public.affiliate_clicks FOR INSERT WITH CHECK (true);


--
-- Name: contact_leads Anyone can insert leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert leads" ON public.contact_leads FOR INSERT WITH CHECK (true);


--
-- Name: login_attempts Anyone can insert login attempts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert login attempts" ON public.login_attempts FOR INSERT WITH CHECK (true);


--
-- Name: affiliate_verification_codes Anyone can insert verification codes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert verification codes" ON public.affiliate_verification_codes FOR INSERT WITH CHECK (true);


--
-- Name: genesis_instance_state_transitions Anyone can read state transitions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read state transitions" ON public.genesis_instance_state_transitions FOR SELECT USING (true);


--
-- Name: crm_collaborator_tokens Anyone can validate tokens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can validate tokens" ON public.crm_collaborator_tokens FOR SELECT USING (true);


--
-- Name: business_niches Anyone can view active niches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active niches" ON public.business_niches FOR SELECT USING ((is_active = true));


--
-- Name: subscription_plans Anyone can view active plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active plans" ON public.subscription_plans FOR SELECT USING ((is_active = true));


--
-- Name: affiliate_proposals Anyone can view completed proposals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view completed proposals" ON public.affiliate_proposals FOR SELECT USING ((questionnaire_completed = true));


--
-- Name: crm_users Authenticated users can create CRM users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create CRM users" ON public.crm_users FOR INSERT WITH CHECK ((auth.uid() IS NOT NULL));


--
-- Name: crm_tenants Authenticated users can create tenants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create tenants" ON public.crm_tenants FOR INSERT WITH CHECK ((auth.uid() IS NOT NULL));


--
-- Name: crm_custom_fields CRM admins can manage custom fields; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "CRM admins can manage custom fields" ON public.crm_custom_fields USING (((crm_tenant_id = public.get_crm_tenant_id(auth.uid())) AND public.is_crm_admin(auth.uid()))) WITH CHECK ((crm_tenant_id = public.get_crm_tenant_id(auth.uid())));


--
-- Name: crm_funnels CRM admins can manage funnels; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "CRM admins can manage funnels" ON public.crm_funnels USING (((crm_tenant_id = public.get_crm_tenant_id(auth.uid())) AND public.is_crm_admin(auth.uid()))) WITH CHECK ((crm_tenant_id = public.get_crm_tenant_id(auth.uid())));


--
-- Name: crm_loss_reasons CRM admins can manage loss reasons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "CRM admins can manage loss reasons" ON public.crm_loss_reasons USING (((crm_tenant_id = public.get_crm_tenant_id(auth.uid())) AND public.is_crm_admin(auth.uid()))) WITH CHECK ((crm_tenant_id = public.get_crm_tenant_id(auth.uid())));


--
-- Name: crm_pipelines CRM admins can manage pipelines; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "CRM admins can manage pipelines" ON public.crm_pipelines USING (((crm_tenant_id = public.get_crm_tenant_id(auth.uid())) AND public.is_crm_admin(auth.uid()))) WITH CHECK ((crm_tenant_id = public.get_crm_tenant_id(auth.uid())));


--
-- Name: crm_funnel_stages CRM admins can manage stages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "CRM admins can manage stages" ON public.crm_funnel_stages USING (((crm_tenant_id = public.get_crm_tenant_id(auth.uid())) AND public.is_crm_admin(auth.uid()))) WITH CHECK ((crm_tenant_id = public.get_crm_tenant_id(auth.uid())));


--
-- Name: crm_users CRM admins can manage users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "CRM admins can manage users" ON public.crm_users USING (((crm_tenant_id = public.get_crm_tenant_id(auth.uid())) AND public.is_crm_admin(auth.uid()))) WITH CHECK (((crm_tenant_id = public.get_crm_tenant_id(auth.uid())) AND public.is_crm_admin(auth.uid())));


--
-- Name: crm_tenants CRM admins can update their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "CRM admins can update their tenant" ON public.crm_tenants FOR UPDATE USING ((public.is_crm_member(auth.uid(), id) AND public.is_crm_admin(auth.uid())));


--
-- Name: crm_audit_logs CRM admins can view audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "CRM admins can view audit logs" ON public.crm_audit_logs FOR SELECT USING (((crm_tenant_id = public.get_crm_tenant_id(auth.uid())) AND public.is_crm_admin(auth.uid())));


--
-- Name: crm_audit_logs CRM users can insert audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "CRM users can insert audit logs" ON public.crm_audit_logs FOR INSERT WITH CHECK ((crm_tenant_id = public.get_crm_tenant_id(auth.uid())));


--
-- Name: crm_lead_history CRM users can insert lead history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "CRM users can insert lead history" ON public.crm_lead_history FOR INSERT WITH CHECK ((crm_tenant_id = public.get_crm_tenant_id(auth.uid())));


--
-- Name: crm_lead_tags CRM users can manage lead tags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "CRM users can manage lead tags" ON public.crm_lead_tags USING ((EXISTS ( SELECT 1
   FROM public.crm_leads
  WHERE ((crm_leads.id = crm_lead_tags.lead_id) AND (crm_leads.crm_tenant_id = public.get_crm_tenant_id(auth.uid())))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.crm_leads
  WHERE ((crm_leads.id = crm_lead_tags.lead_id) AND (crm_leads.crm_tenant_id = public.get_crm_tenant_id(auth.uid()))))));


--
-- Name: crm_leads CRM users can manage leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "CRM users can manage leads" ON public.crm_leads USING ((crm_tenant_id = public.get_crm_tenant_id(auth.uid()))) WITH CHECK ((crm_tenant_id = public.get_crm_tenant_id(auth.uid())));


--
-- Name: crm_tags CRM users can manage tags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "CRM users can manage tags" ON public.crm_tags USING ((crm_tenant_id = public.get_crm_tenant_id(auth.uid()))) WITH CHECK ((crm_tenant_id = public.get_crm_tenant_id(auth.uid())));


--
-- Name: crm_tasks CRM users can manage tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "CRM users can manage tasks" ON public.crm_tasks USING ((crm_tenant_id = public.get_crm_tenant_id(auth.uid()))) WITH CHECK ((crm_tenant_id = public.get_crm_tenant_id(auth.uid())));


--
-- Name: crm_collaborator_tokens CRM users can manage tokens in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "CRM users can manage tokens in their tenant" ON public.crm_collaborator_tokens USING ((crm_tenant_id = public.get_crm_tenant_id(auth.uid()))) WITH CHECK ((crm_tenant_id = public.get_crm_tenant_id(auth.uid())));


--
-- Name: crm_notifications CRM users can update their notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "CRM users can update their notifications" ON public.crm_notifications FOR UPDATE USING ((crm_tenant_id = public.get_crm_tenant_id(auth.uid())));


--
-- Name: crm_custom_fields CRM users can view custom fields; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "CRM users can view custom fields" ON public.crm_custom_fields FOR SELECT USING ((crm_tenant_id = public.get_crm_tenant_id(auth.uid())));


--
-- Name: crm_funnels CRM users can view funnels; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "CRM users can view funnels" ON public.crm_funnels FOR SELECT USING ((crm_tenant_id = public.get_crm_tenant_id(auth.uid())));


--
-- Name: crm_lead_history CRM users can view lead history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "CRM users can view lead history" ON public.crm_lead_history FOR SELECT USING ((crm_tenant_id = public.get_crm_tenant_id(auth.uid())));


--
-- Name: crm_leads CRM users can view leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "CRM users can view leads" ON public.crm_leads FOR SELECT USING ((crm_tenant_id = public.get_crm_tenant_id(auth.uid())));


--
-- Name: crm_loss_reasons CRM users can view loss reasons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "CRM users can view loss reasons" ON public.crm_loss_reasons FOR SELECT USING ((crm_tenant_id = public.get_crm_tenant_id(auth.uid())));


--
-- Name: crm_pipelines CRM users can view pipelines; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "CRM users can view pipelines" ON public.crm_pipelines FOR SELECT USING ((crm_tenant_id = public.get_crm_tenant_id(auth.uid())));


--
-- Name: crm_funnel_stages CRM users can view stages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "CRM users can view stages" ON public.crm_funnel_stages FOR SELECT USING ((crm_tenant_id = public.get_crm_tenant_id(auth.uid())));


--
-- Name: crm_tags CRM users can view tags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "CRM users can view tags" ON public.crm_tags FOR SELECT USING ((crm_tenant_id = public.get_crm_tenant_id(auth.uid())));


--
-- Name: crm_tasks CRM users can view tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "CRM users can view tasks" ON public.crm_tasks FOR SELECT USING ((crm_tenant_id = public.get_crm_tenant_id(auth.uid())));


--
-- Name: crm_notifications CRM users can view their notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "CRM users can view their notifications" ON public.crm_notifications FOR SELECT USING ((crm_tenant_id = public.get_crm_tenant_id(auth.uid())));


--
-- Name: crm_users CRM users can view their teammates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "CRM users can view their teammates" ON public.crm_users FOR SELECT USING (((crm_tenant_id = public.get_crm_tenant_id(auth.uid())) OR public.is_owner(auth.uid())));


--
-- Name: crm_tenants CRM users can view their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "CRM users can view their tenant" ON public.crm_tenants FOR SELECT USING ((public.is_crm_member(auth.uid(), id) OR public.is_owner(auth.uid())));


--
-- Name: contact_leads Owner can delete leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can delete leads" ON public.contact_leads FOR DELETE USING (public.is_owner(auth.uid()));


--
-- Name: email_logs Owner can insert email logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can insert email logs" ON public.email_logs FOR INSERT WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: system_logs Owner can insert system logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can insert system logs" ON public.system_logs FOR INSERT WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: crm_users Owner can manage all CRM users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage all CRM users" ON public.crm_users USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: affiliates Owner can manage all affiliates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage all affiliates" ON public.affiliates USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: affiliate_clicks Owner can manage all clicks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage all clicks" ON public.affiliate_clicks USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: crm_custom_fields Owner can manage all custom fields; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage all custom fields" ON public.crm_custom_fields USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: crm_funnels Owner can manage all funnels; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage all funnels" ON public.crm_funnels USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: crm_leads Owner can manage all leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage all leads" ON public.crm_leads USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: crm_loss_reasons Owner can manage all loss reasons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage all loss reasons" ON public.crm_loss_reasons USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: crm_pipelines Owner can manage all pipelines; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage all pipelines" ON public.crm_pipelines USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: affiliate_proposals Owner can manage all proposals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage all proposals" ON public.affiliate_proposals USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: proposal_questionnaire_history Owner can manage all questionnaire history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage all questionnaire history" ON public.proposal_questionnaire_history USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: affiliate_referrals Owner can manage all referrals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage all referrals" ON public.affiliate_referrals USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: crm_funnel_stages Owner can manage all stages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage all stages" ON public.crm_funnel_stages USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: crm_tags Owner can manage all tags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage all tags" ON public.crm_tags USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: crm_tasks Owner can manage all tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage all tasks" ON public.crm_tasks USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: crm_tenants Owner can manage all tenants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage all tenants" ON public.crm_tenants USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: affiliate_withdrawals Owner can manage all withdrawals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage all withdrawals" ON public.affiliate_withdrawals USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_api_projects Owner can manage api projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage api projects" ON public.whatsapp_api_projects USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_automation_templates Owner can manage automation templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage automation templates" ON public.whatsapp_automation_templates USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_backend_config Owner can manage backend config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage backend config" ON public.whatsapp_backend_config USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_button_actions Owner can manage button actions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage button actions" ON public.whatsapp_button_actions USING (public.is_owner(auth.uid()));


--
-- Name: whatsapp_button_clicks Owner can manage button clicks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage button clicks" ON public.whatsapp_button_clicks USING (public.is_owner(auth.uid()));


--
-- Name: whatsapp_conversation_states Owner can manage conversation states; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage conversation states" ON public.whatsapp_conversation_states USING (public.is_owner(auth.uid()));


--
-- Name: email_templates Owner can manage email templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage email templates" ON public.email_templates USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_event_queue Owner can manage event queue; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage event queue" ON public.whatsapp_event_queue USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_external_webhooks Owner can manage external webhooks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage external webhooks" ON public.whatsapp_external_webhooks USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_instances Owner can manage instances; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage instances" ON public.whatsapp_instances USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_interactive_templates Owner can manage interactive templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage interactive templates" ON public.whatsapp_interactive_templates USING (public.is_owner(auth.uid()));


--
-- Name: affiliate_materials Owner can manage materials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage materials" ON public.affiliate_materials USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_message_logs Owner can manage message logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage message logs" ON public.whatsapp_message_logs USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: business_niches Owner can manage niches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage niches" ON public.business_niches USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: owner_settings Owner can manage owner settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage owner settings" ON public.owner_settings USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: subscription_plans Owner can manage plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage plans" ON public.subscription_plans USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_project_instances Owner can manage project instances; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage project instances" ON public.whatsapp_project_instances USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_rate_limits Owner can manage rate limits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage rate limits" ON public.whatsapp_rate_limits USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_template_sends Owner can manage template sends; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage template sends" ON public.whatsapp_template_sends USING (public.is_owner(auth.uid()));


--
-- Name: whatsapp_templates Owner can manage whatsapp templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage whatsapp templates" ON public.whatsapp_templates USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_alerts Owner can manage whatsapp_alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage whatsapp_alerts" ON public.whatsapp_alerts USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_api_keys Owner can manage whatsapp_api_keys; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage whatsapp_api_keys" ON public.whatsapp_api_keys USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_audit_logs Owner can manage whatsapp_audit_logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage whatsapp_audit_logs" ON public.whatsapp_audit_logs USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_automations Owner can manage whatsapp_automations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage whatsapp_automations" ON public.whatsapp_automations USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_away_messages Owner can manage whatsapp_away_messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage whatsapp_away_messages" ON public.whatsapp_away_messages USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_business_hours Owner can manage whatsapp_business_hours; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage whatsapp_business_hours" ON public.whatsapp_business_hours USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_contacts Owner can manage whatsapp_contacts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage whatsapp_contacts" ON public.whatsapp_contacts USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_conversations Owner can manage whatsapp_conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage whatsapp_conversations" ON public.whatsapp_conversations USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_group_participants Owner can manage whatsapp_group_participants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage whatsapp_group_participants" ON public.whatsapp_group_participants USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_groups Owner can manage whatsapp_groups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage whatsapp_groups" ON public.whatsapp_groups USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_health_checks Owner can manage whatsapp_health_checks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage whatsapp_health_checks" ON public.whatsapp_health_checks USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_inbox Owner can manage whatsapp_inbox; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage whatsapp_inbox" ON public.whatsapp_inbox USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_labels Owner can manage whatsapp_labels; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage whatsapp_labels" ON public.whatsapp_labels USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_metrics Owner can manage whatsapp_metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage whatsapp_metrics" ON public.whatsapp_metrics USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_quick_replies Owner can manage whatsapp_quick_replies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage whatsapp_quick_replies" ON public.whatsapp_quick_replies USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_scheduled_messages Owner can manage whatsapp_scheduled_messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage whatsapp_scheduled_messages" ON public.whatsapp_scheduled_messages USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_security_settings Owner can manage whatsapp_security_settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage whatsapp_security_settings" ON public.whatsapp_security_settings USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_send_queue Owner can manage whatsapp_send_queue; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage whatsapp_send_queue" ON public.whatsapp_send_queue USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_webhook_logs Owner can manage whatsapp_webhook_logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage whatsapp_webhook_logs" ON public.whatsapp_webhook_logs USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_webhooks Owner can manage whatsapp_webhooks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can manage whatsapp_webhooks" ON public.whatsapp_webhooks USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: contact_leads Owner can update leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can update leads" ON public.contact_leads FOR UPDATE USING (public.is_owner(auth.uid()));


--
-- Name: crm_audit_logs Owner can view all audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can view all audit logs" ON public.crm_audit_logs FOR SELECT USING (public.is_owner(auth.uid()));


--
-- Name: whatsapp_api_logs Owner can view api logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can view api logs" ON public.whatsapp_api_logs FOR SELECT USING (public.is_owner(auth.uid()));


--
-- Name: email_logs Owner can view email logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can view email logs" ON public.email_logs FOR SELECT USING (public.is_owner(auth.uid()));


--
-- Name: fraud_protection Owner can view fraud logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can view fraud logs" ON public.fraud_protection FOR SELECT USING (public.is_owner(auth.uid()));


--
-- Name: contact_leads Owner can view leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can view leads" ON public.contact_leads FOR SELECT USING (public.is_owner(auth.uid()));


--
-- Name: system_logs Owner can view system logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can view system logs" ON public.system_logs FOR SELECT USING (public.is_owner(auth.uid()));


--
-- Name: email_webhook_events Owner can view webhook events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can view webhook events" ON public.email_webhook_events FOR SELECT USING (public.is_owner(auth.uid()));


--
-- Name: whatsapp_circuit_breaker Owner full access circuit_breaker; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner full access circuit_breaker" ON public.whatsapp_circuit_breaker USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_flow_edges Owner full access flow_edges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner full access flow_edges" ON public.whatsapp_flow_edges USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_flow_nodes Owner full access flow_nodes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner full access flow_nodes" ON public.whatsapp_flow_nodes USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_phone_validation Owner full access phone_validation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner full access phone_validation" ON public.whatsapp_phone_validation USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: whatsapp_stability_logs Owner full access stability_logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner full access stability_logs" ON public.whatsapp_stability_logs USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));


--
-- Name: genesis_webhook_events Service role can insert webhook events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert webhook events" ON public.genesis_webhook_events FOR INSERT WITH CHECK (true);


--
-- Name: genesis_webhook_rate_limits Service role can manage rate limits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage rate limits" ON public.genesis_webhook_rate_limits USING (true);


--
-- Name: genesis_webhook_events Service role can update webhook events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can update webhook events" ON public.genesis_webhook_events FOR UPDATE USING (true);


--
-- Name: genesis_webhook_sources Service role only for webhook sources; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role only for webhook sources" ON public.genesis_webhook_sources USING (false) WITH CHECK (false);


--
-- Name: admin_users Super admins can manage admin users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can manage admin users" ON public.admin_users TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: genesis_instances Super admins can manage all instances; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can manage all instances" ON public.genesis_instances USING (public.is_genesis_super_admin(auth.uid()));


--
-- Name: genesis_users Super admins can manage all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can manage all users" ON public.genesis_users USING (public.is_genesis_super_admin(auth.uid()));


--
-- Name: genesis_credits Super admins can manage credits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can manage credits" ON public.genesis_credits USING (public.is_genesis_super_admin(auth.uid()));


--
-- Name: genesis_user_roles Super admins can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can manage roles" ON public.genesis_user_roles USING (public.is_genesis_super_admin(auth.uid()));


--
-- Name: user_roles Super admins can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can manage roles" ON public.user_roles TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: genesis_subscriptions Super admins can manage subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can manage subscriptions" ON public.genesis_subscriptions USING (public.is_genesis_super_admin(auth.uid()));


--
-- Name: genesis_users Super admins can view all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can view all users" ON public.genesis_users FOR SELECT USING (public.is_genesis_super_admin(auth.uid()));


--
-- Name: genesis_vps_nodes Super admins manage VPS nodes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins manage VPS nodes" ON public.genesis_vps_nodes USING (public.is_genesis_super_admin(auth.uid()));


--
-- Name: genesis_webhook_dead_letters Super admins manage all dead letters; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins manage all dead letters" ON public.genesis_webhook_dead_letters USING (public.is_genesis_super_admin(auth.uid()));


--
-- Name: genesis_instance_failovers Super admins manage all failovers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins manage all failovers" ON public.genesis_instance_failovers USING (public.is_genesis_super_admin(auth.uid()));


--
-- Name: genesis_session_backups Super admins manage all session backups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins manage all session backups" ON public.genesis_session_backups USING (public.is_genesis_super_admin(auth.uid()));


--
-- Name: genesis_webhook_configs Super admins manage all webhook configs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins manage all webhook configs" ON public.genesis_webhook_configs USING (public.is_genesis_super_admin(auth.uid()));


--
-- Name: genesis_webhook_events Super admins manage all webhook events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins manage all webhook events" ON public.genesis_webhook_events USING (public.is_genesis_super_admin(auth.uid()));


--
-- Name: owner_github_config Super admins manage github config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins manage github config" ON public.owner_github_config USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'super_admin'::public.app_role))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'super_admin'::public.app_role)))));


--
-- Name: flow_execution_history System can insert flow executions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert flow executions" ON public.flow_execution_history FOR INSERT WITH CHECK (true);


--
-- Name: fraud_protection System can insert fraud logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert fraud logs" ON public.fraud_protection FOR INSERT WITH CHECK (true);


--
-- Name: genesis_instance_metrics System can insert metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert metrics" ON public.genesis_instance_metrics FOR INSERT WITH CHECK (true);


--
-- Name: flow_node_executions System can insert node executions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert node executions" ON public.flow_node_executions FOR INSERT WITH CHECK (true);


--
-- Name: crm_notifications System can insert notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert notifications" ON public.crm_notifications FOR INSERT WITH CHECK (true);


--
-- Name: email_confirmation_tokens System can insert tokens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert tokens" ON public.email_confirmation_tokens FOR INSERT WITH CHECK (true);


--
-- Name: email_webhook_events System can insert webhook events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert webhook events" ON public.email_webhook_events FOR INSERT WITH CHECK (true);


--
-- Name: genesis_alerts System can manage alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage alerts" ON public.genesis_alerts USING (true);


--
-- Name: flow_execution_context System can manage execution context; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage execution context" ON public.flow_execution_context USING (true);


--
-- Name: genesis_realtime_metrics System can manage realtime metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage realtime metrics" ON public.genesis_realtime_metrics USING (true);


--
-- Name: affiliate_verification_codes System can select verification codes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can select verification codes" ON public.affiliate_verification_codes FOR SELECT USING (true);


--
-- Name: flow_execution_history System can update flow executions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can update flow executions" ON public.flow_execution_history FOR UPDATE USING (true);


--
-- Name: flow_node_executions System can update node executions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can update node executions" ON public.flow_node_executions FOR UPDATE USING (true);


--
-- Name: affiliate_verification_codes System can update verification codes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can update verification codes" ON public.affiliate_verification_codes FOR UPDATE USING (true) WITH CHECK (true);


--
-- Name: rate_limits System manages rate limits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System manages rate limits" ON public.rate_limits USING (true) WITH CHECK (true);


--
-- Name: genesis_alert_rules Users can manage own alert rules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own alert rules" ON public.genesis_alert_rules USING ((auth.uid() = user_id));


--
-- Name: genesis_webhook_dead_letters Users can manage own dead letters; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own dead letters" ON public.genesis_webhook_dead_letters USING ((webhook_config_id IN ( SELECT genesis_webhook_configs.id
   FROM public.genesis_webhook_configs
  WHERE (genesis_webhook_configs.user_id = public.get_genesis_user_id(auth.uid())))));


--
-- Name: genesis_instances Users can manage own instances; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own instances" ON public.genesis_instances USING ((user_id IN ( SELECT genesis_users.id
   FROM public.genesis_users
  WHERE (genesis_users.auth_user_id = auth.uid()))));


--
-- Name: genesis_webhook_configs Users can manage own webhook configs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own webhook configs" ON public.genesis_webhook_configs USING ((user_id = public.get_genesis_user_id(auth.uid())));


--
-- Name: flow_ai_settings Users can manage their AI settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their AI settings" ON public.flow_ai_settings USING ((scope_id = auth.uid()));


--
-- Name: email_confirmation_tokens Users can only view own tokens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only view own tokens" ON public.email_confirmation_tokens FOR SELECT USING (public.validate_token_owner(user_id));


--
-- Name: genesis_credits Users can update own credits for welcome bonus; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own credits for welcome bonus" ON public.genesis_credits FOR UPDATE USING ((user_id IN ( SELECT genesis_users.id
   FROM public.genesis_users
  WHERE (genesis_users.auth_user_id = auth.uid())))) WITH CHECK ((user_id IN ( SELECT genesis_users.id
   FROM public.genesis_users
  WHERE (genesis_users.auth_user_id = auth.uid()))));


--
-- Name: genesis_users Users can update own data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own data" ON public.genesis_users FOR UPDATE USING ((auth_user_id = auth.uid()));


--
-- Name: genesis_alerts Users can view own alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own alerts" ON public.genesis_alerts FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: genesis_credits Users can view own credits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own credits" ON public.genesis_credits FOR SELECT USING ((user_id IN ( SELECT genesis_users.id
   FROM public.genesis_users
  WHERE (genesis_users.auth_user_id = auth.uid()))));


--
-- Name: genesis_users Users can view own data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own data" ON public.genesis_users FOR SELECT USING ((auth_user_id = auth.uid()));


--
-- Name: genesis_instances Users can view own instances; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own instances" ON public.genesis_instances FOR SELECT USING ((user_id IN ( SELECT genesis_users.id
   FROM public.genesis_users
  WHERE (genesis_users.auth_user_id = auth.uid()))));


--
-- Name: genesis_instance_metrics Users can view own metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own metrics" ON public.genesis_instance_metrics FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: genesis_realtime_metrics Users can view own realtime metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own realtime metrics" ON public.genesis_realtime_metrics FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.genesis_instances
  WHERE ((genesis_instances.id = genesis_realtime_metrics.instance_id) AND (genesis_instances.user_id = auth.uid())))));


--
-- Name: genesis_user_roles Users can view own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own roles" ON public.genesis_user_roles FOR SELECT USING ((user_id IN ( SELECT genesis_users.id
   FROM public.genesis_users
  WHERE (genesis_users.auth_user_id = auth.uid()))));


--
-- Name: genesis_subscriptions Users can view own subscription; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own subscription" ON public.genesis_subscriptions FOR SELECT USING ((user_id IN ( SELECT genesis_users.id
   FROM public.genesis_users
  WHERE (genesis_users.auth_user_id = auth.uid()))));


--
-- Name: genesis_webhook_events Users can view own webhook events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own webhook events" ON public.genesis_webhook_events FOR SELECT USING ((webhook_config_id IN ( SELECT genesis_webhook_configs.id
   FROM public.genesis_webhook_configs
  WHERE (genesis_webhook_configs.user_id = public.get_genesis_user_id(auth.uid())))));


--
-- Name: flow_ai_settings Users can view their AI settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their AI settings" ON public.flow_ai_settings FOR SELECT USING (((scope_id = auth.uid()) OR (scope_type = 'global'::text)));


--
-- Name: flow_execution_context Users can view their execution context; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their execution context" ON public.flow_execution_context FOR SELECT USING ((flow_id IN ( SELECT whatsapp_automation_rules.id
   FROM public.whatsapp_automation_rules
  WHERE (whatsapp_automation_rules.user_id = auth.uid()))));


--
-- Name: flow_execution_history Users can view their flow executions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their flow executions" ON public.flow_execution_history FOR SELECT USING ((flow_id IN ( SELECT whatsapp_automation_rules.id
   FROM public.whatsapp_automation_rules
  WHERE (whatsapp_automation_rules.user_id = auth.uid()))));


--
-- Name: genesis_instance_events Users can view their instance events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their instance events" ON public.genesis_instance_events FOR SELECT USING ((instance_id IN ( SELECT genesis_instances.id
   FROM public.genesis_instances
  WHERE (genesis_instances.user_id = auth.uid()))));


--
-- Name: genesis_instance_tokens Users can view their instance tokens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their instance tokens" ON public.genesis_instance_tokens FOR SELECT USING ((instance_id IN ( SELECT genesis_instances.id
   FROM public.genesis_instances
  WHERE (genesis_instances.user_id = auth.uid()))));


--
-- Name: flow_node_executions Users can view their node executions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their node executions" ON public.flow_node_executions FOR SELECT USING ((flow_id IN ( SELECT whatsapp_automation_rules.id
   FROM public.whatsapp_automation_rules
  WHERE (whatsapp_automation_rules.user_id = auth.uid()))));


--
-- Name: genesis_credit_transactions Users can view their own transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own transactions" ON public.genesis_credit_transactions FOR SELECT USING ((user_id IN ( SELECT genesis_users.id
   FROM public.genesis_users
  WHERE (genesis_users.auth_user_id = auth.uid()))));


--
-- Name: genesis_session_backups Users create own instance backups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users create own instance backups" ON public.genesis_session_backups FOR INSERT WITH CHECK ((instance_id IN ( SELECT genesis_instances.id
   FROM public.genesis_instances
  WHERE (genesis_instances.user_id = public.get_genesis_user_id(auth.uid())))));


--
-- Name: genesis_vps_nodes Users view active VPS nodes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users view active VPS nodes" ON public.genesis_vps_nodes FOR SELECT USING (((is_active = true) AND (status = 'online'::text)));


--
-- Name: genesis_session_backups Users view own instance backups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users view own instance backups" ON public.genesis_session_backups FOR SELECT USING ((instance_id IN ( SELECT genesis_instances.id
   FROM public.genesis_instances
  WHERE (genesis_instances.user_id = public.get_genesis_user_id(auth.uid())))));


--
-- Name: genesis_instance_failovers Users view own instance failovers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users view own instance failovers" ON public.genesis_instance_failovers FOR SELECT USING ((instance_id IN ( SELECT genesis_instances.id
   FROM public.genesis_instances
  WHERE (genesis_instances.user_id = public.get_genesis_user_id(auth.uid())))));


--
-- Name: admin_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

--
-- Name: affiliate_clicks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

--
-- Name: affiliate_materials; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.affiliate_materials ENABLE ROW LEVEL SECURITY;

--
-- Name: affiliate_proposals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.affiliate_proposals ENABLE ROW LEVEL SECURITY;

--
-- Name: affiliate_referrals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;

--
-- Name: affiliate_verification_codes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.affiliate_verification_codes ENABLE ROW LEVEL SECURITY;

--
-- Name: affiliate_withdrawals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.affiliate_withdrawals ENABLE ROW LEVEL SECURITY;

--
-- Name: affiliates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

--
-- Name: appointments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

--
-- Name: audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: barber_availability; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.barber_availability ENABLE ROW LEVEL SECURITY;

--
-- Name: barber_leaves; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.barber_leaves ENABLE ROW LEVEL SECURITY;

--
-- Name: barber_performance; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.barber_performance ENABLE ROW LEVEL SECURITY;

--
-- Name: barber_schedules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.barber_schedules ENABLE ROW LEVEL SECURITY;

--
-- Name: barbers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;

--
-- Name: blocked_slots; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;

--
-- Name: business_niches; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.business_niches ENABLE ROW LEVEL SECURITY;

--
-- Name: chatpro_config; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chatpro_config ENABLE ROW LEVEL SECURITY;

--
-- Name: contact_leads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crm_audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_collaborator_tokens; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crm_collaborator_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_custom_fields; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crm_custom_fields ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_funnel_stages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crm_funnel_stages ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_funnels; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crm_funnels ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_lead_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crm_lead_history ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_lead_tags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crm_lead_tags ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_leads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_loss_reasons; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crm_loss_reasons ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crm_notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_pipelines; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crm_pipelines ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_tags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crm_tags ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_tasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_tenants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crm_tenants ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crm_users ENABLE ROW LEVEL SECURITY;

--
-- Name: email_confirmation_tokens; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.email_confirmation_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: email_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: email_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: email_webhook_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.email_webhook_events ENABLE ROW LEVEL SECURITY;

--
-- Name: feedbacks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_ai_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.flow_ai_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_execution_context; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.flow_execution_context ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_execution_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.flow_execution_history ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_node_executions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.flow_node_executions ENABLE ROW LEVEL SECURITY;

--
-- Name: fraud_protection; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.fraud_protection ENABLE ROW LEVEL SECURITY;

--
-- Name: genesis_alert_rules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.genesis_alert_rules ENABLE ROW LEVEL SECURITY;

--
-- Name: genesis_alerts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.genesis_alerts ENABLE ROW LEVEL SECURITY;

--
-- Name: genesis_credit_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.genesis_credit_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: genesis_credit_usage; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.genesis_credit_usage ENABLE ROW LEVEL SECURITY;

--
-- Name: genesis_credit_usage genesis_credit_usage_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY genesis_credit_usage_insert ON public.genesis_credit_usage FOR INSERT WITH CHECK (true);


--
-- Name: genesis_credit_usage genesis_credit_usage_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY genesis_credit_usage_select ON public.genesis_credit_usage FOR SELECT USING (((user_id IN ( SELECT genesis_users.id
   FROM public.genesis_users
  WHERE (genesis_users.auth_user_id = auth.uid()))) OR public.is_owner(auth.uid())));


--
-- Name: genesis_credits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.genesis_credits ENABLE ROW LEVEL SECURITY;

--
-- Name: genesis_event_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.genesis_event_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: genesis_event_logs genesis_event_logs_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY genesis_event_logs_insert ON public.genesis_event_logs FOR INSERT WITH CHECK (true);


--
-- Name: genesis_event_logs genesis_event_logs_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY genesis_event_logs_select ON public.genesis_event_logs FOR SELECT USING (((user_id IN ( SELECT genesis_users.id
   FROM public.genesis_users
  WHERE (genesis_users.auth_user_id = auth.uid()))) OR public.is_owner(auth.uid())));


--
-- Name: genesis_instance_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.genesis_instance_events ENABLE ROW LEVEL SECURITY;

--
-- Name: genesis_instance_failovers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.genesis_instance_failovers ENABLE ROW LEVEL SECURITY;

--
-- Name: genesis_instance_metrics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.genesis_instance_metrics ENABLE ROW LEVEL SECURITY;

--
-- Name: genesis_instance_state_transitions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.genesis_instance_state_transitions ENABLE ROW LEVEL SECURITY;

--
-- Name: genesis_instance_tokens; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.genesis_instance_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: genesis_instances; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.genesis_instances ENABLE ROW LEVEL SECURITY;

--
-- Name: genesis_realtime_metrics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.genesis_realtime_metrics ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_automation_rules genesis_rules_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY genesis_rules_delete ON public.whatsapp_automation_rules FOR DELETE USING ((((user_id = public.get_genesis_user_id(auth.uid())) AND (instance_id IN ( SELECT genesis_instances.id
   FROM public.genesis_instances
  WHERE (genesis_instances.user_id = public.get_genesis_user_id(auth.uid()))))) OR public.is_genesis_super_admin(auth.uid())));


--
-- Name: whatsapp_automation_rules genesis_rules_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY genesis_rules_insert ON public.whatsapp_automation_rules FOR INSERT WITH CHECK ((((user_id = public.get_genesis_user_id(auth.uid())) AND (instance_id IN ( SELECT genesis_instances.id
   FROM public.genesis_instances
  WHERE (genesis_instances.user_id = public.get_genesis_user_id(auth.uid()))))) OR public.is_genesis_super_admin(auth.uid())));


--
-- Name: whatsapp_automation_rules genesis_rules_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY genesis_rules_select ON public.whatsapp_automation_rules FOR SELECT USING ((((user_id = public.get_genesis_user_id(auth.uid())) AND (instance_id IN ( SELECT genesis_instances.id
   FROM public.genesis_instances
  WHERE (genesis_instances.user_id = public.get_genesis_user_id(auth.uid()))))) OR public.is_genesis_super_admin(auth.uid())));


--
-- Name: whatsapp_automation_rules genesis_rules_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY genesis_rules_update ON public.whatsapp_automation_rules FOR UPDATE USING ((((user_id = public.get_genesis_user_id(auth.uid())) AND (instance_id IN ( SELECT genesis_instances.id
   FROM public.genesis_instances
  WHERE (genesis_instances.user_id = public.get_genesis_user_id(auth.uid()))))) OR public.is_genesis_super_admin(auth.uid())));


--
-- Name: genesis_session_backups; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.genesis_session_backups ENABLE ROW LEVEL SECURITY;

--
-- Name: genesis_subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.genesis_subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: genesis_user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.genesis_user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: genesis_users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.genesis_users ENABLE ROW LEVEL SECURITY;

--
-- Name: genesis_vps_nodes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.genesis_vps_nodes ENABLE ROW LEVEL SECURITY;

--
-- Name: genesis_webhook_configs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.genesis_webhook_configs ENABLE ROW LEVEL SECURITY;

--
-- Name: genesis_webhook_dead_letters; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.genesis_webhook_dead_letters ENABLE ROW LEVEL SECURITY;

--
-- Name: genesis_webhook_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.genesis_webhook_events ENABLE ROW LEVEL SECURITY;

--
-- Name: genesis_webhook_rate_limits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.genesis_webhook_rate_limits ENABLE ROW LEVEL SECURITY;

--
-- Name: genesis_webhook_sources; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.genesis_webhook_sources ENABLE ROW LEVEL SECURITY;

--
-- Name: genesis_webhooks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.genesis_webhooks ENABLE ROW LEVEL SECURITY;

--
-- Name: genesis_webhooks genesis_webhooks_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY genesis_webhooks_delete ON public.genesis_webhooks FOR DELETE USING ((user_id IN ( SELECT genesis_users.id
   FROM public.genesis_users
  WHERE (genesis_users.auth_user_id = auth.uid()))));


--
-- Name: genesis_webhooks genesis_webhooks_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY genesis_webhooks_insert ON public.genesis_webhooks FOR INSERT WITH CHECK ((user_id IN ( SELECT genesis_users.id
   FROM public.genesis_users
  WHERE (genesis_users.auth_user_id = auth.uid()))));


--
-- Name: genesis_webhooks genesis_webhooks_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY genesis_webhooks_select ON public.genesis_webhooks FOR SELECT USING (((user_id IN ( SELECT genesis_users.id
   FROM public.genesis_users
  WHERE (genesis_users.auth_user_id = auth.uid()))) OR public.is_owner(auth.uid())));


--
-- Name: genesis_webhooks genesis_webhooks_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY genesis_webhooks_update ON public.genesis_webhooks FOR UPDATE USING ((user_id IN ( SELECT genesis_users.id
   FROM public.genesis_users
  WHERE (genesis_users.auth_user_id = auth.uid()))));


--
-- Name: login_attempts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

--
-- Name: marketing_campaigns; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

--
-- Name: marketing_contacts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.marketing_contacts ENABLE ROW LEVEL SECURITY;

--
-- Name: marketing_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.marketing_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: message_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: monthly_goals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.monthly_goals ENABLE ROW LEVEL SECURITY;

--
-- Name: owner_github_config; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.owner_github_config ENABLE ROW LEVEL SECURITY;

--
-- Name: owner_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.owner_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: proposal_questionnaire_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.proposal_questionnaire_history ENABLE ROW LEVEL SECURITY;

--
-- Name: push_subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: queue; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.queue ENABLE ROW LEVEL SECURITY;

--
-- Name: rate_limits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

--
-- Name: services; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

--
-- Name: shop_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: shop_subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.shop_subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: site_analytics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.site_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: subscription_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: system_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_settings tenant_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_isolation ON public.admin_settings TO authenticated USING ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids))) WITH CHECK ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids)));


--
-- Name: appointments tenant_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_isolation ON public.appointments TO authenticated USING ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids))) WITH CHECK ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids)));


--
-- Name: barber_availability tenant_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_isolation ON public.barber_availability TO authenticated USING ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids))) WITH CHECK ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids)));


--
-- Name: barber_leaves tenant_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_isolation ON public.barber_leaves TO authenticated USING ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids))) WITH CHECK ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids)));


--
-- Name: barber_performance tenant_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_isolation ON public.barber_performance TO authenticated USING ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids))) WITH CHECK ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids)));


--
-- Name: barber_schedules tenant_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_isolation ON public.barber_schedules TO authenticated USING ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids))) WITH CHECK ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids)));


--
-- Name: barbers tenant_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_isolation ON public.barbers TO authenticated USING ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids))) WITH CHECK ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids)));


--
-- Name: blocked_slots tenant_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_isolation ON public.blocked_slots TO authenticated USING ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids))) WITH CHECK ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids)));


--
-- Name: chatpro_config tenant_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_isolation ON public.chatpro_config TO authenticated USING ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids))) WITH CHECK ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids)));


--
-- Name: feedbacks tenant_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_isolation ON public.feedbacks TO authenticated USING ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids))) WITH CHECK ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids)));


--
-- Name: marketing_campaigns tenant_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_isolation ON public.marketing_campaigns TO authenticated USING ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids))) WITH CHECK ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids)));


--
-- Name: marketing_contacts tenant_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_isolation ON public.marketing_contacts TO authenticated USING ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids))) WITH CHECK ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids)));


--
-- Name: marketing_settings tenant_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_isolation ON public.marketing_settings TO authenticated USING ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids))) WITH CHECK ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids)));


--
-- Name: message_templates tenant_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_isolation ON public.message_templates TO authenticated USING ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids))) WITH CHECK ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids)));


--
-- Name: monthly_goals tenant_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_isolation ON public.monthly_goals TO authenticated USING ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids))) WITH CHECK ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids)));


--
-- Name: push_subscriptions tenant_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_isolation ON public.push_subscriptions TO authenticated USING ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids))) WITH CHECK ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids)));


--
-- Name: queue tenant_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_isolation ON public.queue TO authenticated USING ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids))) WITH CHECK ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids)));


--
-- Name: services tenant_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_isolation ON public.services TO authenticated USING ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids))) WITH CHECK ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids)));


--
-- Name: shop_settings tenant_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_isolation ON public.shop_settings TO authenticated USING ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids))) WITH CHECK ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids)));


--
-- Name: shop_subscriptions tenant_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_isolation ON public.shop_subscriptions TO authenticated USING ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids))) WITH CHECK ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids)));


--
-- Name: site_analytics tenant_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_isolation ON public.site_analytics TO authenticated USING ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids))) WITH CHECK ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids)));


--
-- Name: usage_metrics tenant_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_isolation ON public.usage_metrics TO authenticated USING ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids))) WITH CHECK ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids)));


--
-- Name: user_profiles tenant_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_isolation ON public.user_profiles TO authenticated USING ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids))) WITH CHECK ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids)));


--
-- Name: webhook_configs tenant_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_isolation ON public.webhook_configs TO authenticated USING ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids))) WITH CHECK ((tenant_id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids)));


--
-- Name: tenants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

--
-- Name: tenants tenants_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenants_select ON public.tenants FOR SELECT TO authenticated USING ((id IN ( SELECT public.current_tenant_ids() AS current_tenant_ids)));


--
-- Name: usage_metrics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;

--
-- Name: user_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_tenants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_tenants ENABLE ROW LEVEL SECURITY;

--
-- Name: user_tenants user_tenants_no_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_tenants_no_write ON public.user_tenants TO authenticated USING (false) WITH CHECK (false);


--
-- Name: user_tenants user_tenants_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_tenants_select ON public.user_tenants FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: webhook_configs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.webhook_configs ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_alerts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_alerts ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_api_keys; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_api_keys ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_api_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_api_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_api_projects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_api_projects ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_automation_rules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_automation_rules ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_automation_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_automation_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_automations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_automations ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_away_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_away_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_backend_config; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_backend_config ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_business_hours; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_business_hours ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_button_actions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_button_actions ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_button_clicks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_button_clicks ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_circuit_breaker; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_circuit_breaker ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_contacts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_contacts ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_conversation_states; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_conversation_states ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_conversations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_event_queue; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_event_queue ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_external_webhooks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_external_webhooks ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_flow_edges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_flow_edges ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_flow_nodes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_flow_nodes ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_group_participants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_group_participants ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_groups; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_groups ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_health_checks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_health_checks ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_inbox; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_inbox ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_instances; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_interactive_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_interactive_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_labels; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_labels ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_message_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_message_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_metrics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_metrics ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_phone_validation; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_phone_validation ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_project_instances; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_project_instances ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_quick_replies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_quick_replies ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_rate_limits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_rate_limits ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_scheduled_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_scheduled_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_security_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_security_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_send_queue; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_send_queue ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_stability_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_stability_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_template_sends; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_template_sends ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_webhook_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_webhook_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_webhooks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_webhooks ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;