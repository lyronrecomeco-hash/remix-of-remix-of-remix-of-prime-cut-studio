ALTER TABLE public.genesis_cakto_analytics 
  ADD COLUMN IF NOT EXISTS pix_generated integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pix_expired integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS purchases_chargeback integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS boleto_generated integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS boleto_expired integer DEFAULT 0;