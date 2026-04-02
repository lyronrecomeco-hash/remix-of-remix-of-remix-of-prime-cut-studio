-- Drop existing policies
DROP POLICY IF EXISTS "checkout_plans_select_all" ON public.checkout_plans;
DROP POLICY IF EXISTS "checkout_plans_update_admin" ON public.checkout_plans;
DROP POLICY IF EXISTS "checkout_plans_insert_admin" ON public.checkout_plans;

-- Recreate with proper roles
CREATE POLICY "checkout_plans_select_all"
ON public.checkout_plans FOR SELECT
TO public
USING (true);

CREATE POLICY "checkout_plans_update_admin"
ON public.checkout_plans FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "checkout_plans_insert_admin"
ON public.checkout_plans FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "checkout_plans_delete_admin"
ON public.checkout_plans FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));