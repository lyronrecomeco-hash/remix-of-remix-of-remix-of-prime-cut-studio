ALTER TABLE public.checkout_plans ADD COLUMN IF NOT EXISTS checkout_url text;
ALTER TABLE public.checkout_gateway_config ADD COLUMN IF NOT EXISTS cakto_client_id_hash text;
ALTER TABLE public.checkout_gateway_config ADD COLUMN IF NOT EXISTS cakto_client_secret_hash text;
ALTER TABLE public.checkout_payments ADD COLUMN IF NOT EXISTS cakto_order_id text;
ALTER TABLE public.checkout_payments ADD COLUMN IF NOT EXISTS cakto_checkout_url text;