-- Adicionar política RLS para permitir usuários criarem seu próprio registro de afiliado
CREATE POLICY "Users can create their own affiliate"
ON public.affiliates
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Adicionar política para usuários atualizarem seu próprio registro
CREATE POLICY "Users can update their own affiliate"
ON public.affiliates
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());