-- =====================================================
-- GENESIS INSTANCE INTEGRATIONS - ENTERPRISE READY
-- =====================================================

-- Tabela principal de integrações por instância
CREATE TABLE public.genesis_instance_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID NOT NULL
    REFERENCES public.genesis_instances(id)
    ON DELETE CASCADE,
  user_id UUID NOT NULL
    REFERENCES public.genesis_users(id)
    ON DELETE CASCADE,
  -- Provider controlado (evita lixo e bugs)
  provider TEXT NOT NULL CHECK (
    provider IN (
      'shopify',
      'woocommerce',
      'nuvemshop',
      'mercadoshops',
      'rdstation'
    )
  ),
  -- Estado da integração
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'connected', 'error', 'disconnected')),
  -- Credenciais (JSON criptografado no backend)
  credentials_encrypted TEXT,
  -- Dados da loja / conta
  store_url TEXT,
  store_name TEXT,
  -- Webhooks
  webhook_url TEXT,
  webhook_secret TEXT,
  -- Metadados específicos por provider
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Sync / erros
  last_sync_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Uma integração por provider por instância
  UNIQUE (instance_id, provider)
);

-- =====================================================
-- INDEXES (performance)
-- =====================================================
CREATE INDEX idx_genesis_integrations_instance
  ON public.genesis_instance_integrations(instance_id);

CREATE INDEX idx_genesis_integrations_user
  ON public.genesis_instance_integrations(user_id);

CREATE INDEX idx_genesis_integrations_provider
  ON public.genesis_instance_integrations(provider);

CREATE INDEX idx_genesis_integrations_status
  ON public.genesis_instance_integrations(status);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.genesis_instance_integrations
ENABLE ROW LEVEL SECURITY;

-- SELECT
CREATE POLICY "Users can view own integrations"
ON public.genesis_instance_integrations
FOR SELECT
USING (
  user_id = public.get_genesis_user_id(auth.uid())
);

-- INSERT
CREATE POLICY "Users can create own integrations"
ON public.genesis_instance_integrations
FOR INSERT
WITH CHECK (
  user_id = public.get_genesis_user_id(auth.uid())
);

-- UPDATE
CREATE POLICY "Users can update own integrations"
ON public.genesis_instance_integrations
FOR UPDATE
USING (
  user_id = public.get_genesis_user_id(auth.uid())
);

-- DELETE
CREATE POLICY "Users can delete own integrations"
ON public.genesis_instance_integrations
FOR DELETE
USING (
  user_id = public.get_genesis_user_id(auth.uid())
);

-- =====================================================
-- TRIGGER updated_at
-- =====================================================
CREATE TRIGGER update_genesis_instance_integrations_updated_at
BEFORE UPDATE ON public.genesis_instance_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();