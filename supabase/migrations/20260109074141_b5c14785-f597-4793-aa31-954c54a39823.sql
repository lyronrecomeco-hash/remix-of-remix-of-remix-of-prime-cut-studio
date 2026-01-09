BEGIN;

-- Migrar valores antigos (se existirem) para os novos tipos usados no app
UPDATE public.genesis_campaigns
SET campaign_type = CASE campaign_type
  WHEN 'mass_send' THEN 'marketing'
  WHEN 'promotion' THEN 'marketing'
  WHEN 'reengagement' THEN 'marketing'
  WHEN 'reminder' THEN 'notificacao'
  WHEN 'custom' THEN 'integracao'
  ELSE campaign_type
END
WHERE campaign_type IN ('mass_send','promotion','reengagement','reminder','custom');

-- Ajustar default para casar com o frontend
ALTER TABLE public.genesis_campaigns
  ALTER COLUMN campaign_type SET DEFAULT 'marketing';

-- Substituir constraint para aceitar os novos valores
ALTER TABLE public.genesis_campaigns
  DROP CONSTRAINT IF EXISTS genesis_campaigns_campaign_type_check;

ALTER TABLE public.genesis_campaigns
  ADD CONSTRAINT genesis_campaigns_campaign_type_check
  CHECK (campaign_type = ANY (ARRAY['marketing'::text,'notificacao'::text,'integracao'::text]));

COMMIT;