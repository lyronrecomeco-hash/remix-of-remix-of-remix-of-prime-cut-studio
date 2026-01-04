-- ============================================================
-- OWNER PANEL - GITHUB CONFIGURATION (SINGLETON)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.owner_github_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Repositório
  repository_url TEXT NOT NULL,
  branch TEXT NOT NULL DEFAULT 'main',
  -- Token GitHub (NÃO armazenar em texto puro)
  github_token_secret_id UUID, -- referencia a secret segura (vault / secrets table)
  -- Controle
  is_active BOOLEAN NOT NULL DEFAULT true,
  -- Metadados do projeto VPS
  project_name TEXT NOT NULL DEFAULT 'whatsapp-backend',
  install_path TEXT NOT NULL DEFAULT '/opt/whatsapp-backend',
  pm2_app_name TEXT NOT NULL DEFAULT 'whatsapp-backend',
  node_version TEXT NOT NULL DEFAULT '20',
  -- Auditoria
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- CONSTRAINTS
-- ============================================================

-- Garantir que exista APENAS UMA configuração (singleton)
CREATE UNIQUE INDEX IF NOT EXISTS owner_github_config_singleton
ON public.owner_github_config ((true));

-- Validar URL de repositório GitHub
ALTER TABLE public.owner_github_config
ADD CONSTRAINT owner_github_config_repo_url_check
CHECK (
  repository_url ~* '^https://github\.com/[A-Za-z0-9._-]+/[A-Za-z0-9._-]+(\.git)?$'
);

-- Validar nome do app PM2
ALTER TABLE public.owner_github_config
ADD CONSTRAINT owner_github_config_pm2_name_check
CHECK (
  pm2_app_name ~ '^[a-zA-Z0-9._-]+$'
);

-- Validar install_path
ALTER TABLE public.owner_github_config
ADD CONSTRAINT owner_github_config_install_path_check
CHECK (
  install_path ~ '^/[^ ]+$'
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.owner_github_config ENABLE ROW LEVEL SECURITY;

-- Apenas super_admin pode ler ou escrever
DROP POLICY IF EXISTS "Super admins manage github config" ON public.owner_github_config;

CREATE POLICY "Super admins manage github config"
ON public.owner_github_config
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'super_admin'
  )
);

-- ============================================================
-- TRIGGER updated_at
-- ============================================================

DROP TRIGGER IF EXISTS update_owner_github_config_updated_at
ON public.owner_github_config;

CREATE TRIGGER update_owner_github_config_updated_at
BEFORE UPDATE ON public.owner_github_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();