-- ============================================================
-- SISTEMA MULTI-TENANT SAAS – VERSÃO AJUSTADA
-- ============================================================

-- EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. ADICIONAR COLUNAS FALTANTES EM TENANTS
-- ============================================================
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'Meu Negócio';
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS owner_user_id UUID;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- ============================================================
-- 2. ADICIONAR COLUNAS FALTANTES EM USER_TENANTS
-- ============================================================
ALTER TABLE public.user_tenants ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
ALTER TABLE public.user_tenants ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT true;
ALTER TABLE public.user_tenants ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ============================================================
-- 3. GALERIA MULTI-TENANT
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. TRIGGER updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tenants_updated_at ON public.tenants;
CREATE TRIGGER trg_tenants_updated_at
BEFORE UPDATE ON public.tenants
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_gallery_updated_at ON public.gallery_images;
CREATE TRIGGER trg_gallery_updated_at
BEFORE UPDATE ON public.gallery_images
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 5. FUNÇÃO: CRIAR TENANT AUTOMÁTICO
-- ============================================================
CREATE OR REPLACE FUNCTION public.ensure_user_tenant()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id UUID;
  v_user_email TEXT;
BEGIN
  SELECT tenant_id
  INTO v_tenant_id
  FROM public.user_tenants
  WHERE user_id = NEW.id
  LIMIT 1;

  IF v_tenant_id IS NULL THEN
    SELECT email INTO v_user_email FROM auth.users WHERE id = NEW.id;

    INSERT INTO public.tenants (name, owner_user_id)
    VALUES (COALESCE(v_user_email, 'Meu Negócio'), NEW.id)
    RETURNING id INTO v_tenant_id;

    INSERT INTO public.user_tenants (user_id, tenant_id, role, is_default, is_active)
    VALUES (NEW.id, v_tenant_id, 'owner', true, true);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================
-- 6. FUNÇÕES DE CONTEXTO
-- ============================================================
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id
  FROM public.user_tenants
  WHERE user_id = auth.uid()
    AND is_active = true
    AND is_default = true
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.current_tenant_ids()
RETURNS SETOF UUID AS $$
  SELECT tenant_id
  FROM public.user_tenants
  WHERE user_id = auth.uid()
    AND is_active = true;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- ============================================================
-- 7. BACKFILL – CRIAR TENANT PARA USUÁRIOS EXISTENTES
-- ============================================================
DO $$
DECLARE
  r RECORD;
  v_tenant_id UUID;
BEGIN
  FOR r IN
    SELECT u.id, u.email
    FROM auth.users u
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_tenants ut WHERE ut.user_id = u.id
    )
  LOOP
    INSERT INTO public.tenants (name, owner_user_id)
    VALUES (COALESCE(r.email, 'Meu Negócio'), r.id)
    RETURNING id INTO v_tenant_id;

    INSERT INTO public.user_tenants (user_id, tenant_id, role, is_default, is_active)
    VALUES (r.id, v_tenant_id, 'owner', true, true);
  END LOOP;
END $$;

-- ============================================================
-- 8. Atualizar user_tenants existentes
-- ============================================================
UPDATE public.user_tenants SET is_default = true WHERE is_default IS NULL;
UPDATE public.user_tenants SET is_active = true WHERE is_active IS NULL;

-- ============================================================
-- 9. RLS
-- ============================================================
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 10. POLICIES – TENANTS
-- ============================================================
DROP POLICY IF EXISTS "View own tenants" ON public.tenants;
CREATE POLICY "View own tenants"
ON public.tenants
FOR SELECT TO authenticated
USING (id IN (SELECT tenant_id FROM public.user_tenants WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Create tenant" ON public.tenants;
CREATE POLICY "Create tenant"
ON public.tenants
FOR INSERT TO authenticated
WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "Update owned tenant" ON public.tenants;
CREATE POLICY "Update owned tenant"
ON public.tenants
FOR UPDATE TO authenticated
USING (owner_user_id = auth.uid());

-- ============================================================
-- 11. POLICIES – USER_TENANTS
-- ============================================================
DROP POLICY IF EXISTS "View memberships" ON public.user_tenants;
CREATE POLICY "View memberships"
ON public.user_tenants
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR tenant_id IN (
    SELECT tenant_id
    FROM public.user_tenants
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
  )
);

DROP POLICY IF EXISTS "Owner manages members" ON public.user_tenants;
CREATE POLICY "Owner manages members"
ON public.user_tenants
FOR ALL TO authenticated
USING (
  tenant_id IN (
    SELECT tenant_id
    FROM public.user_tenants
    WHERE user_id = auth.uid()
      AND role = 'owner'
  )
);

-- ============================================================
-- 12. POLICIES – GALLERY
-- ============================================================
DROP POLICY IF EXISTS "View gallery (tenant)" ON public.gallery_images;
CREATE POLICY "View gallery (tenant)"
ON public.gallery_images
FOR SELECT TO authenticated
USING (tenant_id IN (SELECT public.current_tenant_ids()));

DROP POLICY IF EXISTS "Manage gallery (tenant)" ON public.gallery_images;
CREATE POLICY "Manage gallery (tenant)"
ON public.gallery_images
FOR ALL TO authenticated
USING (tenant_id IN (SELECT public.current_tenant_ids()))
WITH CHECK (tenant_id IN (SELECT public.current_tenant_ids()));

DROP POLICY IF EXISTS "Public view active images" ON public.gallery_images;
CREATE POLICY "Public view active images"
ON public.gallery_images
FOR SELECT TO anon
USING (is_active = true);

-- ============================================================
-- 13. ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_user_tenants_user ON public.user_tenants(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tenants_tenant ON public.user_tenants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_tenants_default ON public.user_tenants(user_id, is_default, is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_tenant ON public.gallery_images(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenants_owner ON public.tenants(owner_user_id);

-- ============================================================
-- 14. STATUS DA API GENESIS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.genesis_api_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  service_type TEXT NOT NULL
    CHECK (service_type IN ('instance', 'automation', 'campaign', 'webhook', 'api')),
  status TEXT NOT NULL
    CHECK (status IN ('operational', 'degraded', 'outage', 'maintenance')),
  response_time_ms INTEGER,
  last_check_at TIMESTAMPTZ DEFAULT now(),
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 15. FUNÇÃO – STATUS GERAL DA GENESIS
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_genesis_status_summary()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'instances', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'connected', COUNT(*) FILTER (WHERE status = 'connected'),
        'disconnected', COUNT(*) FILTER (WHERE status = 'disconnected'),
        'connecting', COUNT(*) FILTER (WHERE status = 'connecting')
      )
      FROM public.genesis_instances
    ),
    'automations', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'active', COUNT(*) FILTER (WHERE is_active = true),
        'inactive', COUNT(*) FILTER (WHERE is_active = false)
      )
      FROM public.whatsapp_automations
    ),
    'campaigns', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'running', COUNT(*) FILTER (WHERE status = 'running'),
        'paused', COUNT(*) FILTER (WHERE status = 'paused'),
        'completed', COUNT(*) FILTER (WHERE status = 'completed')
      )
      FROM public.genesis_campaigns
    ),
    'last_updated', now()
  )
  INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;