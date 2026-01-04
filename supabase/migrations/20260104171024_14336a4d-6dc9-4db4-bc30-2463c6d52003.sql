-- =====================================================
-- VINCULAR FLUXOS À INSTÂNCIA (VERSÃO CORRIGIDA)
-- =====================================================

-- 1. Adicionar coluna permitindo NULL temporariamente
ALTER TABLE public.whatsapp_automation_rules
ADD COLUMN IF NOT EXISTS instance_id UUID
REFERENCES public.genesis_instances(id)
ON DELETE CASCADE;

-- 2. Associar TODOS os fluxos à primeira instância existente
UPDATE public.whatsapp_automation_rules
SET instance_id = (
    SELECT id FROM public.genesis_instances ORDER BY created_at ASC LIMIT 1
)
WHERE instance_id IS NULL;

-- 3. Garantir que não existem fluxos órfãos
DELETE FROM public.whatsapp_automation_rules
WHERE instance_id IS NULL;

-- 4. Agora sim, travar NOT NULL
ALTER TABLE public.whatsapp_automation_rules
ALTER COLUMN instance_id SET NOT NULL;

-- 5. Índice para performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_automation_rules_instance
ON public.whatsapp_automation_rules(instance_id);

-- 6. Documentação interna
COMMENT ON COLUMN public.whatsapp_automation_rules.instance_id IS
'Instância de WhatsApp vinculada a este fluxo. Isolamento total por número, usuário e sessão.';