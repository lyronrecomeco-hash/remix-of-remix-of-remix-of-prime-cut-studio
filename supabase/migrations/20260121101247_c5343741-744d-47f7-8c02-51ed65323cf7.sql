-- Add misticpay_transaction_id column to checkout_payments
ALTER TABLE public.checkout_payments 
ADD COLUMN IF NOT EXISTS misticpay_transaction_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_checkout_payments_misticpay_transaction_id 
ON public.checkout_payments(misticpay_transaction_id) 
WHERE misticpay_transaction_id IS NOT NULL;

-- Add misticpay credentials columns to checkout_gateway_config
ALTER TABLE public.checkout_gateway_config 
ADD COLUMN IF NOT EXISTS misticpay_client_id_hash TEXT,
ADD COLUMN IF NOT EXISTS misticpay_client_secret_hash TEXT;