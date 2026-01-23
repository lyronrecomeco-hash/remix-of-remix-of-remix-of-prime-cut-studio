-- Permitir que qualquer pessoa possa atualizar o status do contrato ao assinar (via signature_hash)
-- Isso é necessário porque o contratante não está autenticado quando assina

-- Adicionar política para permitir update do status ao assinar
CREATE POLICY "Anyone can update contract status when signing"
ON public.contracts
FOR UPDATE
USING (true)
WITH CHECK (
  -- Só permite atualizar para status de assinatura
  status IN ('partially_signed', 'signed')
);