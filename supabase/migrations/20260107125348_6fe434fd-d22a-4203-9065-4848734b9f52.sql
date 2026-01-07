-- =====================================================
-- FIX: Permitir leitura pública de whatsapp_automations (chatbots são configurações globais do sistema)
-- E permitir que o service role crie sessões sem constraint de unique quando status muda
-- =====================================================

-- 1. Adicionar política de SELECT público para whatsapp_automations
-- Chatbots ativos são configurações públicas do sistema, não dados sensíveis
CREATE POLICY "Anyone can view active automations"
ON public.whatsapp_automations
FOR SELECT
USING (is_active = true);

-- 2. Adicionar política para usuários autenticados gerenciarem chatbots
CREATE POLICY "Authenticated users can manage automations"
ON public.whatsapp_automations
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Corrigir constraint de chatbot_sessions para permitir múltiplas sessões cancelled
-- Primeiro remover a constraint problemática se existir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'chatbot_sessions_contact_id_instance_id_status_key'
  ) THEN
    ALTER TABLE public.chatbot_sessions 
    DROP CONSTRAINT chatbot_sessions_contact_id_instance_id_status_key;
  END IF;
END $$;

-- 4. Criar índice único parcial apenas para sessões ATIVAS (permite múltiplas cancelled)
CREATE UNIQUE INDEX IF NOT EXISTS chatbot_sessions_active_unique 
ON public.chatbot_sessions (contact_id, instance_id) 
WHERE status = 'active';

-- 5. Permitir que chatbot_sessions aceite instance_id NULL (para testes)
-- Remover a foreign key constraint temporariamente não é necessário, mas permitir NULL
ALTER TABLE public.chatbot_sessions 
ALTER COLUMN instance_id DROP NOT NULL;

-- 6. Adicionar política de acesso público para leitura de chatbot_sessions (para debug/visualização)
CREATE POLICY "Anyone can view sessions"
ON public.chatbot_sessions
FOR SELECT
USING (true);