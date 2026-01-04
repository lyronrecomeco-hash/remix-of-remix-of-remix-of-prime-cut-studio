-- =============================================================================
-- FASE 9: POOL DE VPS - GERENCIAMENTO DISTRIBUÍDO
-- Sistema de balanceamento de carga e failover entre múltiplos nós VPS
-- =============================================================================

-- 1. Tabela de nós VPS do pool
CREATE TABLE IF NOT EXISTS public.genesis_vps_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificação
    name TEXT NOT NULL,
    region TEXT NOT NULL DEFAULT 'br-south',
    base_url TEXT NOT NULL UNIQUE,
    
    -- Capacidade
    max_instances INTEGER NOT NULL DEFAULT 50,
    current_instances INTEGER NOT NULL DEFAULT 0,
    
    -- Métricas de saúde
    cpu_load NUMERIC(5,2) DEFAULT 0,
    memory_load NUMERIC(5,2) DEFAULT 0,
    avg_latency_ms INTEGER DEFAULT 0,
    
    -- Status do nó
    status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'draining', 'maintenance')),
    health_score INTEGER DEFAULT 100 CHECK (health_score BETWEEN 0 AND 100),
    
    -- Controle
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    last_heartbeat_at TIMESTAMP WITH TIME ZONE,
    last_health_check_at TIMESTAMP WITH TIME ZONE,
    
    -- Autenticação
    api_token TEXT NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. Tabela de failovers/migrações de instâncias
CREATE TABLE IF NOT EXISTS public.genesis_instance_failovers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID NOT NULL REFERENCES public.genesis_instances(id) ON DELETE CASCADE,
    
    -- Nós envolvidos
    source_node_id UUID REFERENCES public.genesis_vps_nodes(id),
    target_node_id UUID NOT NULL REFERENCES public.genesis_vps_nodes(id),
    
    -- Controle
    reason TEXT NOT NULL CHECK (reason IN ('node_failure', 'load_balance', 'manual', 'maintenance', 'health_degraded')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'backing_up', 'migrating', 'restoring', 'completed', 'failed', 'cancelled')),
    
    -- Dados do processo
    backup_id UUID REFERENCES public.genesis_session_backups(id),
    error_message TEXT,
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 3. Adicionar referência ao nó na tabela de instâncias
ALTER TABLE public.genesis_instances
ADD COLUMN IF NOT EXISTS vps_node_id UUID REFERENCES public.genesis_vps_nodes(id),
ADD COLUMN IF NOT EXISTS preferred_region TEXT DEFAULT 'br-south',
ADD COLUMN IF NOT EXISTS failover_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_failover_at TIMESTAMP WITH TIME ZONE;

-- 4. Índices para performance
CREATE INDEX IF NOT EXISTS idx_vps_nodes_status 
ON public.genesis_vps_nodes(status, is_active);

CREATE INDEX IF NOT EXISTS idx_vps_nodes_capacity 
ON public.genesis_vps_nodes(current_instances, max_instances) 
WHERE is_active = true AND status = 'online';

CREATE INDEX IF NOT EXISTS idx_vps_nodes_region 
ON public.genesis_vps_nodes(region, health_score DESC);

CREATE INDEX IF NOT EXISTS idx_failovers_instance 
ON public.genesis_instance_failovers(instance_id, status);

CREATE INDEX IF NOT EXISTS idx_instances_node 
ON public.genesis_instances(vps_node_id);

-- 5. RLS para nós VPS
ALTER TABLE public.genesis_vps_nodes ENABLE ROW LEVEL SECURITY;

-- Apenas super admins podem gerenciar nós
CREATE POLICY "Super admins manage VPS nodes"
ON public.genesis_vps_nodes
FOR ALL
USING (public.is_genesis_super_admin(auth.uid()));

-- Usuários podem ver nós ativos (para seleção de região)
CREATE POLICY "Users view active VPS nodes"
ON public.genesis_vps_nodes
FOR SELECT
USING (is_active = true AND status = 'online');

-- 6. RLS para failovers
ALTER TABLE public.genesis_instance_failovers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage all failovers"
ON public.genesis_instance_failovers
FOR ALL
USING (public.is_genesis_super_admin(auth.uid()));

CREATE POLICY "Users view own instance failovers"
ON public.genesis_instance_failovers
FOR SELECT
USING (
    instance_id IN (
        SELECT id FROM public.genesis_instances 
        WHERE user_id = public.get_genesis_user_id(auth.uid())
    )
);

-- 7. Função para selecionar melhor nó disponível
CREATE OR REPLACE FUNCTION public.genesis_select_best_node(
    p_region TEXT DEFAULT NULL,
    p_exclude_node_id UUID DEFAULT NULL
)
RETURNS TABLE (
    node_id UUID,
    node_name TEXT,
    node_url TEXT,
    available_slots INTEGER,
    health_score INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
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

-- 8. Função para registrar heartbeat de nó
CREATE OR REPLACE FUNCTION public.genesis_node_heartbeat(
    p_node_id UUID,
    p_cpu_load NUMERIC DEFAULT 0,
    p_memory_load NUMERIC DEFAULT 0,
    p_instance_count INTEGER DEFAULT 0,
    p_avg_latency INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 9. Função para iniciar failover
CREATE OR REPLACE FUNCTION public.genesis_initiate_failover(
    p_instance_id UUID,
    p_reason TEXT DEFAULT 'manual',
    p_target_node_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 10. Função para completar failover
CREATE OR REPLACE FUNCTION public.genesis_complete_failover(
    p_failover_id UUID,
    p_success BOOLEAN,
    p_error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 11. Função para detectar nós offline e iniciar failovers automáticos
CREATE OR REPLACE FUNCTION public.genesis_detect_offline_nodes()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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