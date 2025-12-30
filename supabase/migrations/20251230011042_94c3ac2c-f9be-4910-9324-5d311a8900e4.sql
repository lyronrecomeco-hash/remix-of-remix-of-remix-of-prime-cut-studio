-- =========================================================
-- SEGURANÇA DE PONTA — ALTO NÍVEL
-- =========================================================

-- =========================================================
-- 1) AUTO-PROVISIONAMENTO DE TENANT
-- =========================================================
CREATE OR REPLACE FUNCTION public.auto_provision_tenant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id uuid;
BEGIN
  SELECT tenant_id
  INTO v_tenant_id
  FROM public.user_tenants
  WHERE user_id = NEW.id;

  IF v_tenant_id IS NULL THEN
    INSERT INTO public.tenants DEFAULT VALUES
    RETURNING id INTO v_tenant_id;

    INSERT INTO public.user_tenants (user_id, tenant_id, role)
    VALUES (NEW.id, v_tenant_id, 'owner');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_provision_tenant ON auth.users;

CREATE TRIGGER trg_auto_provision_tenant
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.auto_provision_tenant();

-- =========================================================
-- 2) FUNÇÃO BASE DE TENANT ATUAL
-- =========================================================
CREATE OR REPLACE FUNCTION public.current_tenant_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id
  FROM public.user_tenants
  WHERE user_id = auth.uid();
$$;

-- =========================================================
-- 3) RLS — TENANTS
-- =========================================================
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenants_select ON public.tenants;

CREATE POLICY tenants_select
ON public.tenants
FOR SELECT
TO authenticated
USING (
  id IN (SELECT public.current_tenant_ids())
);

-- =========================================================
-- 4) RLS — USER_TENANTS (ANTI-ESCALAÇÃO TOTAL)
-- =========================================================
ALTER TABLE public.user_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tenants FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_tenants_select ON public.user_tenants;
DROP POLICY IF EXISTS user_tenants_insert ON public.user_tenants;
DROP POLICY IF EXISTS user_tenants_update ON public.user_tenants;
DROP POLICY IF EXISTS user_tenants_delete ON public.user_tenants;

CREATE POLICY user_tenants_select
ON public.user_tenants
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY user_tenants_insert
ON public.user_tenants
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY user_tenants_update
ON public.user_tenants
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY user_tenants_delete
ON public.user_tenants
FOR DELETE
TO authenticated
USING (false);

-- =========================================================
-- 5) RLS GLOBAL — TODAS AS TABELAS MULTI-TENANT
-- =========================================================
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'admin_settings',
    'appointments',
    'barber_availability',
    'barber_leaves',
    'barber_performance',
    'barber_schedules',
    'barbers',
    'blocked_slots',
    'chatpro_config',
    'feedbacks',
    'marketing_campaigns',
    'marketing_contacts',
    'marketing_settings',
    'message_templates',
    'monthly_goals',
    'push_subscriptions',
    'queue',
    'services',
    'shop_settings',
    'shop_subscriptions',
    'site_analytics',
    'usage_metrics',
    'user_profiles',
    'webhook_configs'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY tenant_isolation
       ON public.%I
       FOR ALL
       TO authenticated
       USING (tenant_id IN (SELECT public.current_tenant_ids()))
       WITH CHECK (tenant_id IN (SELECT public.current_tenant_ids()))',
      t
    );
  END LOOP;
END $$;

-- =========================================================
-- 6) AUDITORIA DE SEGURANÇA
-- =========================================================
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action text,
  p_entity_type text,
  p_entity_id text DEFAULT NULL,
  p_details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    details
  ) VALUES (
    auth.uid(),
    p_action,
    p_entity_type,
    p_entity_id,
    COALESCE(p_details, '{}'::jsonb) || jsonb_build_object('timestamp', now())
  );
END;
$$;

-- =========================================================
-- 7) ÍNDICES PARA PERFORMANCE DE RLS
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_user_tenants_user_id
ON public.user_tenants(user_id);

CREATE INDEX IF NOT EXISTS idx_user_tenants_tenant_id
ON public.user_tenants(tenant_id);

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'admin_settings',
    'appointments',
    'barber_availability',
    'barber_leaves',
    'barber_performance',
    'barber_schedules',
    'barbers',
    'blocked_slots',
    'chatpro_config',
    'feedbacks',
    'marketing_campaigns',
    'marketing_contacts',
    'marketing_settings',
    'message_templates',
    'monthly_goals',
    'push_subscriptions',
    'queue',
    'services',
    'shop_settings',
    'shop_subscriptions',
    'site_analytics',
    'usage_metrics',
    'user_profiles',
    'webhook_configs'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_%I_tenant_id ON public.%I(tenant_id)',
      t, t
    );
  END LOOP;
END $$;