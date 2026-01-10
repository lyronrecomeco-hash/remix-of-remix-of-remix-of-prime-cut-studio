-- Corrigir RLS policy para genesis_cakto_events
-- O problema é que user_id em genesis_instances referencia genesis_users.id, 
-- não auth.uid() diretamente

-- Primeiro dropar a policy existente
DROP POLICY IF EXISTS "Users read own instance data" ON public.genesis_cakto_events;

-- Criar a policy correta que faz o join via genesis_users
CREATE POLICY "Users read own instance events" 
ON public.genesis_cakto_events 
FOR SELECT 
USING (
  instance_id IN (
    SELECT gi.id 
    FROM genesis_instances gi
    INNER JOIN genesis_users gu ON gu.id = gi.user_id
    WHERE gu.auth_user_id = auth.uid()
  )
);

-- Também verificar e corrigir a policy de genesis_cakto_analytics se existir
DROP POLICY IF EXISTS "Users read own instance analytics" ON public.genesis_cakto_analytics;

CREATE POLICY "Users read own instance analytics" 
ON public.genesis_cakto_analytics 
FOR SELECT 
USING (
  instance_id IN (
    SELECT gi.id 
    FROM genesis_instances gi
    INNER JOIN genesis_users gu ON gu.id = gi.user_id
    WHERE gu.auth_user_id = auth.uid()
  )
);