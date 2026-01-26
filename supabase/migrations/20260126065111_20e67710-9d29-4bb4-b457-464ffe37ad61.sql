-- Tabela para histórico de pesquisas/scans do Serper
CREATE TABLE public.genesis_search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_name TEXT,
  user_email TEXT,
  search_type TEXT NOT NULL DEFAULT 'radar', -- 'radar', 'prospecting', 'manual'
  search_query TEXT,
  city TEXT,
  state TEXT,
  region TEXT,
  niche TEXT,
  results_count INTEGER DEFAULT 0,
  api_key_id UUID REFERENCES public.genesis_api_keys(id),
  credits_used INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_genesis_search_history_user_id ON public.genesis_search_history(user_id);
CREATE INDEX idx_genesis_search_history_created_at ON public.genesis_search_history(created_at DESC);
CREATE INDEX idx_genesis_search_history_search_type ON public.genesis_search_history(search_type);

-- RLS
ALTER TABLE public.genesis_search_history ENABLE ROW LEVEL SECURITY;

-- Política para super_admin ver tudo
CREATE POLICY "Super admin can view all search history"
ON public.genesis_search_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM genesis_users gu
    JOIN genesis_user_roles gur ON gur.user_id = gu.id
    WHERE gu.auth_user_id = auth.uid() AND gur.role = 'super_admin'
  )
);

-- Política para service role inserir
CREATE POLICY "Service role can insert search history"
ON public.genesis_search_history
FOR INSERT
WITH CHECK (true);