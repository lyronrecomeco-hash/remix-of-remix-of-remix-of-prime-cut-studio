-- =========================================================
-- MULTI-TENANT HARD ISOLATION (PRODUÇÃO)
-- =========================================================

-- =========================================================
-- STEP 1: DESABILITAR TRIGGERS DE USUÁRIO (não os de sistema)
-- =========================================================
ALTER TABLE IF EXISTS public.admin_settings DISABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.appointments DISABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.barber_availability DISABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.barber_leaves DISABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.barber_performance DISABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.barber_schedules DISABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.barbers DISABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.blocked_slots DISABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.chatpro_config DISABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.feedbacks DISABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.marketing_campaigns DISABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.marketing_contacts DISABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.marketing_settings DISABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.message_templates DISABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.monthly_goals DISABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.push_subscriptions DISABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.queue DISABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.services DISABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.shop_settings DISABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.shop_subscriptions DISABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.site_analytics DISABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.usage_metrics DISABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.user_profiles DISABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.webhook_configs DISABLE TRIGGER USER;

-- =========================================================
-- STEP 2: HELPERS
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

CREATE OR REPLACE FUNCTION public.set_tenant_id_on_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_tenant uuid;
BEGIN
  IF NEW.tenant_id IS NULL THEN
    SELECT tenant_id
    INTO v_tenant
    FROM public.current_tenant_ids()
    LIMIT 1;
    NEW.tenant_id := v_tenant;
  END IF;
  IF NEW.tenant_id IS NULL THEN
    RAISE EXCEPTION 'tenant_id is required';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_tenant_immutable()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.tenant_id IS DISTINCT FROM OLD.tenant_id THEN
    RAISE EXCEPTION 'tenant_id is immutable';
  END IF;
  RETURN NEW;
END;
$function$;

-- =========================================================
-- STEP 3: AUTO PROVISIONAMENTO DE TENANT
-- =========================================================
CREATE OR REPLACE FUNCTION public.auto_provision_tenant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_tenant uuid;
BEGIN
  SELECT tenant_id
  INTO v_tenant
  FROM public.user_tenants
  WHERE user_id = NEW.id;

  IF v_tenant IS NULL THEN
    INSERT INTO public.tenants DEFAULT VALUES
    RETURNING id INTO v_tenant;

    INSERT INTO public.user_tenants (user_id, tenant_id, role)
    VALUES (NEW.id, v_tenant, 'owner');
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_auto_provision_tenant ON auth.users;
CREATE TRIGGER trg_auto_provision_tenant
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.auto_provision_tenant();

-- =========================================================
-- STEP 4: TENANTS RLS
-- =========================================================
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tenants'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.tenants', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants FORCE ROW LEVEL SECURITY;

CREATE POLICY tenants_select
ON public.tenants
FOR SELECT TO authenticated
USING (id IN (SELECT public.current_tenant_ids()));

-- =========================================================
-- STEP 5: USER_TENANTS RLS (READ ONLY)
-- =========================================================
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_tenants'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_tenants', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.user_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tenants FORCE ROW LEVEL SECURITY;

CREATE POLICY user_tenants_select
ON public.user_tenants
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY user_tenants_no_write
ON public.user_tenants
FOR ALL TO authenticated
USING (false)
WITH CHECK (false);

-- =========================================================
-- STEP 6: BACKFILL TENANT_ID
-- =========================================================
DO $$
DECLARE
  t text;
  v_default_tenant uuid;
  tables text[] := ARRAY[
    'admin_settings','appointments','barber_availability','barber_leaves',
    'barber_performance','barber_schedules','barbers','blocked_slots',
    'chatpro_config','feedbacks','marketing_campaigns','marketing_contacts',
    'marketing_settings','message_templates','monthly_goals','push_subscriptions',
    'queue','services','shop_settings','shop_subscriptions','site_analytics',
    'usage_metrics','user_profiles','webhook_configs'
  ];
BEGIN
  SELECT id INTO v_default_tenant
  FROM public.tenants
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_default_tenant IS NULL THEN
    RAISE EXCEPTION 'No tenant exists for backfill';
  END IF;

  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS tenant_id uuid', t);
    EXECUTE format(
      'UPDATE public.%I
       SET tenant_id = COALESCE(
         (SELECT ut.tenant_id FROM public.user_tenants ut WHERE ut.user_id = public.%I.user_id LIMIT 1),
         $1
       )
       WHERE tenant_id IS NULL',
      t, t
    ) USING v_default_tenant;
  END LOOP;
END $$;

-- =========================================================
-- STEP 7: RLS + TRIGGERS
-- =========================================================
DO $$
DECLARE
  t text;
  pol record;
  tables text[] := ARRAY[
    'admin_settings','appointments','barber_availability','barber_leaves',
    'barber_performance','barber_schedules','barbers','blocked_slots',
    'chatpro_config','feedbacks','marketing_campaigns','marketing_contacts',
    'marketing_settings','message_templates','monthly_goals','push_subscriptions',
    'queue','services','shop_settings','shop_subscriptions','site_analytics',
    'usage_metrics','user_profiles','webhook_configs'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', t);

    FOR pol IN
      SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=t
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, t);
    END LOOP;

    EXECUTE format(
      'CREATE POLICY tenant_isolation ON public.%I
       FOR ALL TO authenticated
       USING (tenant_id IN (SELECT public.current_tenant_ids()))
       WITH CHECK (tenant_id IN (SELECT public.current_tenant_ids()))',
      t
    );

    -- Drop old triggers first
    EXECUTE format('DROP TRIGGER IF EXISTS trg_set_tenant_id ON public.%I', t);
    EXECUTE format('DROP TRIGGER IF EXISTS trg_tenant_immutable ON public.%I', t);

    EXECUTE format(
      'CREATE TRIGGER trg_set_tenant_id
       BEFORE INSERT ON public.%I
       FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_on_insert()',
      t
    );

    EXECUTE format(
      'CREATE TRIGGER trg_tenant_immutable
       BEFORE UPDATE ON public.%I
       FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_immutable()',
      t
    );

    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_%I_tenant_id ON public.%I(tenant_id)', t, t
    );
  END LOOP;
END $$;

-- =========================================================
-- STEP 8: REATIVAR TRIGGERS DE USUÁRIO
-- =========================================================
ALTER TABLE IF EXISTS public.admin_settings ENABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.appointments ENABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.barber_availability ENABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.barber_leaves ENABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.barber_performance ENABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.barber_schedules ENABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.barbers ENABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.blocked_slots ENABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.chatpro_config ENABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.feedbacks ENABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.marketing_campaigns ENABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.marketing_contacts ENABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.marketing_settings ENABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.message_templates ENABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.monthly_goals ENABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.push_subscriptions ENABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.queue ENABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.services ENABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.shop_settings ENABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.shop_subscriptions ENABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.site_analytics ENABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.usage_metrics ENABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.user_profiles ENABLE TRIGGER USER;
ALTER TABLE IF EXISTS public.webhook_configs ENABLE TRIGGER USER;