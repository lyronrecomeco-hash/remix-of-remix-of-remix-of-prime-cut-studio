-- Drop the existing check constraint and create a new one that includes 'cakto'
ALTER TABLE public.genesis_instance_integrations 
DROP CONSTRAINT IF EXISTS genesis_instance_integrations_provider_check;

-- Add the new constraint with 'cakto' included
ALTER TABLE public.genesis_instance_integrations 
ADD CONSTRAINT genesis_instance_integrations_provider_check 
CHECK (provider IN ('shopify', 'woocommerce', 'nuvemshop', 'mercadoshops', 'rdstation', 'cakto', 'hotmart', 'kiwify', 'eduzz', 'monetizze', 'braip', 'perfectpay', 'ticto', 'greenn', 'pepper'));