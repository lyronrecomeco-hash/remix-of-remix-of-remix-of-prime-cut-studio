-- Drop the old check constraint and add a new one including misticpay
ALTER TABLE public.checkout_gateway_config 
DROP CONSTRAINT IF EXISTS checkout_gateway_config_gateway_check;

ALTER TABLE public.checkout_gateway_config 
ADD CONSTRAINT checkout_gateway_config_gateway_check 
CHECK (gateway IN ('abacatepay', 'asaas', 'misticpay'));