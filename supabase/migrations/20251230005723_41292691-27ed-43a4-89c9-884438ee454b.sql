ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.tenants FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenants_select ON public.tenants;

CREATE POLICY tenants_select
ON public.tenants
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_tenants ut
    WHERE ut.user_id = auth.uid()
      AND ut.tenant_id = tenants.id
  )
);