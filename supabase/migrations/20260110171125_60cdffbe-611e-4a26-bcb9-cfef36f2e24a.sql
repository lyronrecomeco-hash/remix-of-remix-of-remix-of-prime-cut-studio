-- Remover check constraint existente e recriar com todos os tipos válidos
ALTER TABLE public.genesis_cakto_events DROP CONSTRAINT IF EXISTS genesis_cakto_events_event_type_check;

-- Adicionar nova constraint com TODOS os tipos de evento
ALTER TABLE public.genesis_cakto_events 
ADD CONSTRAINT genesis_cakto_events_event_type_check 
CHECK (event_type IN (
  'initiate_checkout',
  'checkout_abandonment', 
  'purchase_approved',
  'purchase_refused',
  'purchase_refunded',
  'purchase_chargeback',
  'pix_generated',
  'pix_expired',
  'boleto_generated',
  'boleto_expired'
));

-- Criar índice único para evitar duplicatas por external_id + event_type + instance_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_cakto_events_unique_transaction 
ON public.genesis_cakto_events(instance_id, external_id, event_type);

-- Índice para buscas por telefone (para PIX não pago)
CREATE INDEX IF NOT EXISTS idx_cakto_events_phone_type 
ON public.genesis_cakto_events(customer_phone, event_type, created_at DESC)
WHERE customer_phone IS NOT NULL;