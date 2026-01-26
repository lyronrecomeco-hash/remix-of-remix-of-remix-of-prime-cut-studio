
-- Adicionar coluna auth_user_id na tabela genesis_search_history para melhor rastreamento
ALTER TABLE public.genesis_search_history 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Criar índice para melhorar performance de queries por auth_user_id
CREATE INDEX IF NOT EXISTS idx_genesis_search_history_auth_user_id 
ON public.genesis_search_history(auth_user_id);

-- Criar índice composto para queries filtradas por data
CREATE INDEX IF NOT EXISTS idx_genesis_search_history_user_date 
ON public.genesis_search_history(user_id, created_at DESC);

-- Comentário explicativo
COMMENT ON COLUMN public.genesis_search_history.auth_user_id IS 'ID do usuário autenticado (auth.users) que realizou a busca';
