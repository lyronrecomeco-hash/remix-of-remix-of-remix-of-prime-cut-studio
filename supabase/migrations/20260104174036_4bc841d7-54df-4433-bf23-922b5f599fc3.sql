-- =====================================================
-- CORREÇÃO DEFINITIVA - ISOLAMENTO TOTAL POR USUÁRIO E INSTÂNCIA
-- GenesisAuto / GenesisHub
-- =====================================================

-- =====================================================
-- 1. GARANTIR COLUNAS DE ISOLAMENTO
-- =====================================================

-- user_id → isolamento por conta
ALTER TABLE public.whatsapp_automation_rules
ADD COLUMN IF NOT EXISTS user_id UUID
REFERENCES public.genesis_users(id) ON DELETE CASCADE;

-- instance_id → isolamento por sessão / número
ALTER TABLE public.whatsapp_automation_rules
ADD COLUMN IF NOT EXISTS instance_id UUID
REFERENCES public.genesis_instances(id) ON DELETE CASCADE;

-- =====================================================
-- 2. BACKFILL CONTROLADO (DADOS EXISTENTES)
-- =====================================================

-- Atribuir user_id corretamente
UPDATE public.whatsapp_automation_rules r
SET user_id = i.user_id
FROM public.genesis_instances i
WHERE r.instance_id = i.id
AND r.user_id IS NULL;

-- Atribuir instance_id se existir apenas uma instância
UPDATE public.whatsapp_automation_rules
SET instance_id = (
    SELECT id FROM public.genesis_instances
    ORDER BY created_at ASC
    LIMIT 1
)
WHERE instance_id IS NULL
AND (SELECT COUNT(*) FROM public.genesis_instances) = 1;

-- Remover fluxos inválidos (segurança)
DELETE FROM public.whatsapp_automation_rules
WHERE user_id IS NULL OR instance_id IS NULL;

-- =====================================================
-- 3. TRAVAS DEFINITIVAS
-- =====================================================

ALTER TABLE public.whatsapp_automation_rules
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.whatsapp_automation_rules
ALTER COLUMN instance_id SET NOT NULL;

-- =====================================================
-- 4. ÍNDICES DE PERFORMANCE E ISOLAMENTO
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_rules_user
ON public.whatsapp_automation_rules(user_id);

CREATE INDEX IF NOT EXISTS idx_rules_instance
ON public.whatsapp_automation_rules(instance_id);

CREATE INDEX IF NOT EXISTS idx_rules_user_instance
ON public.whatsapp_automation_rules(user_id, instance_id);

-- =====================================================
-- 5. LIMPAR POLICIES ANTIGAS (QUEBRADAS)
-- =====================================================

DROP POLICY IF EXISTS genesis_rules_select ON public.whatsapp_automation_rules;
DROP POLICY IF EXISTS genesis_rules_insert ON public.whatsapp_automation_rules;
DROP POLICY IF EXISTS genesis_rules_update ON public.whatsapp_automation_rules;
DROP POLICY IF EXISTS genesis_rules_delete ON public.whatsapp_automation_rules;
DROP POLICY IF EXISTS "Users can view their own automation rules" ON public.whatsapp_automation_rules;
DROP POLICY IF EXISTS "Users can insert their own automation rules" ON public.whatsapp_automation_rules;
DROP POLICY IF EXISTS "Users can update their own automation rules" ON public.whatsapp_automation_rules;
DROP POLICY IF EXISTS "Users can delete their own automation rules" ON public.whatsapp_automation_rules;
DROP POLICY IF EXISTS "Owner can manage automation rules" ON public.whatsapp_automation_rules;

-- =====================================================
-- 6. POLICIES CORRETAS (ISOLAMENTO REAL)
-- =====================================================

-- SELECT
CREATE POLICY genesis_rules_select
ON public.whatsapp_automation_rules
FOR SELECT
USING (
    (
        user_id = get_genesis_user_id(auth.uid())
        AND instance_id IN (
            SELECT id FROM public.genesis_instances
            WHERE user_id = get_genesis_user_id(auth.uid())
        )
    )
    OR is_genesis_super_admin(auth.uid())
);

-- INSERT
CREATE POLICY genesis_rules_insert
ON public.whatsapp_automation_rules
FOR INSERT
WITH CHECK (
    (
        user_id = get_genesis_user_id(auth.uid())
        AND instance_id IN (
            SELECT id FROM public.genesis_instances
            WHERE user_id = get_genesis_user_id(auth.uid())
        )
    )
    OR is_genesis_super_admin(auth.uid())
);

-- UPDATE
CREATE POLICY genesis_rules_update
ON public.whatsapp_automation_rules
FOR UPDATE
USING (
    (
        user_id = get_genesis_user_id(auth.uid())
        AND instance_id IN (
            SELECT id FROM public.genesis_instances
            WHERE user_id = get_genesis_user_id(auth.uid())
        )
    )
    OR is_genesis_super_admin(auth.uid())
);

-- DELETE
CREATE POLICY genesis_rules_delete
ON public.whatsapp_automation_rules
FOR DELETE
USING (
    (
        user_id = get_genesis_user_id(auth.uid())
        AND instance_id IN (
            SELECT id FROM public.genesis_instances
            WHERE user_id = get_genesis_user_id(auth.uid())
        )
    )
    OR is_genesis_super_admin(auth.uid())
);

-- =====================================================
-- 7. DOCUMENTAÇÃO INTERNA
-- =====================================================

COMMENT ON COLUMN public.whatsapp_automation_rules.user_id IS
'Usuário dono do fluxo. Isolamento total por conta.';

COMMENT ON COLUMN public.whatsapp_automation_rules.instance_id IS
'Instância WhatsApp vinculada ao fluxo. Garante execução no número correto e estabilidade total.';