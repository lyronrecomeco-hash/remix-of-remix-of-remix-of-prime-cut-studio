-- =============================================================================
-- FASE 8: BACKUP DE SESSÃO
-- Sistema de backup e restore versionado de sessões WhatsApp
-- =============================================================================

-- 1. Tabela de backups de sessão
CREATE TABLE IF NOT EXISTS public.genesis_session_backups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID NOT NULL REFERENCES public.genesis_instances(id) ON DELETE CASCADE,
    
    -- Dados do backup
    storage_path TEXT NOT NULL,
    file_size_bytes BIGINT DEFAULT 0,
    checksum TEXT, -- SHA-256 para verificação de integridade
    
    -- Metadados
    backup_type TEXT DEFAULT 'automatic' CHECK (backup_type IN ('automatic', 'manual', 'pre_disconnect', 'scheduled')),
    session_metadata JSONB DEFAULT '{}',
    
    -- Controle de versão
    version INTEGER NOT NULL DEFAULT 1,
    is_valid BOOLEAN DEFAULT true,
    
    -- Restauração
    restored_at TIMESTAMP WITH TIME ZONE,
    restored_by UUID REFERENCES auth.users(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days')
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_session_backups_instance 
ON public.genesis_session_backups(instance_id);

CREATE INDEX IF NOT EXISTS idx_session_backups_valid 
ON public.genesis_session_backups(instance_id, is_valid, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_session_backups_expires 
ON public.genesis_session_backups(expires_at) WHERE is_valid = true;

-- 2. Criar bucket para armazenar sessões
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'genesis-sessions',
    'genesis-sessions',
    false,
    52428800, -- 50MB limit
    ARRAY['application/zip', 'application/gzip', 'application/octet-stream']
)
ON CONFLICT (id) DO NOTHING;

-- 3. RLS para tabela de backups
ALTER TABLE public.genesis_session_backups ENABLE ROW LEVEL SECURITY;

-- Super admins podem tudo
CREATE POLICY "Super admins manage all session backups"
ON public.genesis_session_backups
FOR ALL
USING (public.is_genesis_super_admin(auth.uid()));

-- Usuários podem ver backups das suas instâncias
CREATE POLICY "Users view own instance backups"
ON public.genesis_session_backups
FOR SELECT
USING (
    instance_id IN (
        SELECT id FROM public.genesis_instances 
        WHERE user_id = public.get_genesis_user_id(auth.uid())
    )
);

-- Usuários podem criar backups das suas instâncias
CREATE POLICY "Users create own instance backups"
ON public.genesis_session_backups
FOR INSERT
WITH CHECK (
    instance_id IN (
        SELECT id FROM public.genesis_instances 
        WHERE user_id = public.get_genesis_user_id(auth.uid())
    )
);

-- 4. Storage policies para o bucket de sessões
CREATE POLICY "Genesis users upload session backups"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'genesis-sessions' AND
    public.get_genesis_user_id(auth.uid()) IS NOT NULL
);

CREATE POLICY "Genesis users read own session backups"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'genesis-sessions' AND
    public.get_genesis_user_id(auth.uid()) IS NOT NULL
);

CREATE POLICY "Genesis super admins manage all session files"
ON storage.objects
FOR ALL
USING (
    bucket_id = 'genesis-sessions' AND
    public.is_genesis_super_admin(auth.uid())
);

-- 5. Função para obter último backup válido
CREATE OR REPLACE FUNCTION public.genesis_get_latest_backup(p_instance_id UUID)
RETURNS TABLE (
    backup_id UUID,
    storage_path TEXT,
    checksum TEXT,
    version INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
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

-- 6. Função para criar backup (retorna dados para upload)
CREATE OR REPLACE FUNCTION public.genesis_create_backup_record(
    p_instance_id UUID,
    p_checksum TEXT DEFAULT NULL,
    p_file_size BIGINT DEFAULT 0,
    p_backup_type TEXT DEFAULT 'automatic',
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 7. Função para marcar backup como restaurado
CREATE OR REPLACE FUNCTION public.genesis_mark_backup_restored(p_backup_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 8. Função para invalidar backups antigos (manter últimos N)
CREATE OR REPLACE FUNCTION public.genesis_cleanup_old_backups(
    p_instance_id UUID,
    p_keep_count INTEGER DEFAULT 5
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 9. Adicionar coluna de referência ao último backup na tabela de instâncias
ALTER TABLE public.genesis_instances
ADD COLUMN IF NOT EXISTS last_backup_id UUID REFERENCES public.genesis_session_backups(id),
ADD COLUMN IF NOT EXISTS last_backup_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS backup_enabled BOOLEAN DEFAULT true;