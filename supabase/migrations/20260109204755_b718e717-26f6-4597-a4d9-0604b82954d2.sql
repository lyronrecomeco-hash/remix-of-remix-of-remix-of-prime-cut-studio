-- Habilitar RLS na genesis_api_status
ALTER TABLE public.genesis_api_status ENABLE ROW LEVEL SECURITY;

-- Policy para leitura pública (status da API é público)
DROP POLICY IF EXISTS "Public read genesis_api_status" ON public.genesis_api_status;
CREATE POLICY "Public read genesis_api_status"
ON public.genesis_api_status
FOR SELECT TO anon, authenticated
USING (true);

-- Policy para gerenciamento (apenas admins via service_role)
DROP POLICY IF EXISTS "Service role manages genesis_api_status" ON public.genesis_api_status;
CREATE POLICY "Service role manages genesis_api_status"
ON public.genesis_api_status
FOR ALL TO service_role
USING (true);

-- Corrigir função set_updated_at com search_path
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;