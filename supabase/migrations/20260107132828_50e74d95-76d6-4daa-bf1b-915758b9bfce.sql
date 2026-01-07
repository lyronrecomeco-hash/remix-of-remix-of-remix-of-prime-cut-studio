-- =====================================================
-- CHATBOT ENTERPRISE FLOW CONTROL
-- Adiciona colunas para fluxo estruturado e controlado
-- =====================================================

-- Coluna flow_config para estrutura completa do fluxo
ALTER TABLE public.whatsapp_automations 
ADD COLUMN IF NOT EXISTS flow_config jsonb DEFAULT '{}'::jsonb;

-- Coluna max_attempts para controle de tentativas inválidas
ALTER TABLE public.whatsapp_automations 
ADD COLUMN IF NOT EXISTS max_attempts integer DEFAULT 3;

-- Coluna fallback_message para resposta de entrada inválida
ALTER TABLE public.whatsapp_automations 
ADD COLUMN IF NOT EXISTS fallback_message text DEFAULT 'Não entendi sua resposta. Por favor, escolha uma opção válida.';

-- Coluna company_name para personalização
ALTER TABLE public.whatsapp_automations 
ADD COLUMN IF NOT EXISTS company_name text DEFAULT 'Nossa Empresa';

-- Adicionar current_step_id na sessão para controle preciso
ALTER TABLE public.chatbot_sessions
ADD COLUMN IF NOT EXISTS current_step_id text DEFAULT 'greeting';

-- Adicionar attempt_count para controle de tentativas
ALTER TABLE public.chatbot_sessions
ADD COLUMN IF NOT EXISTS attempt_count integer DEFAULT 0;

-- Adicionar step_data para dados coletados no passo atual
ALTER TABLE public.chatbot_sessions
ADD COLUMN IF NOT EXISTS step_data jsonb DEFAULT '{}'::jsonb;

-- Comentários explicativos
COMMENT ON COLUMN public.whatsapp_automations.flow_config IS 'Estrutura completa do fluxo: { steps: {...}, transitions: {...} }';
COMMENT ON COLUMN public.whatsapp_automations.max_attempts IS 'Máximo de tentativas inválidas antes de encerrar';
COMMENT ON COLUMN public.chatbot_sessions.current_step_id IS 'ID do passo atual no fluxo';
COMMENT ON COLUMN public.chatbot_sessions.attempt_count IS 'Contador de tentativas inválidas no passo atual';