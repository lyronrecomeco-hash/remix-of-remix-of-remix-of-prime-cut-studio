-- Fix RLS policy so authenticated users can read their own Cakto products
DROP POLICY IF EXISTS "Users read own instance products" ON public.genesis_cakto_products;

CREATE POLICY "Users read own instance products"
ON public.genesis_cakto_products
FOR SELECT
USING (
  instance_id IN (
    SELECT gi.id
    FROM public.genesis_instances gi
    JOIN public.genesis_users gu ON gu.id = gi.user_id
    WHERE gu.auth_user_id = auth.uid()
  )
);

-- Enable realtime updates for products
ALTER PUBLICATION supabase_realtime ADD TABLE public.genesis_cakto_products;
