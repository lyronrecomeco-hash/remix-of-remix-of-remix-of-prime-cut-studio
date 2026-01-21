-- Tabela para configuração de gateways de pagamento
CREATE TABLE IF NOT EXISTS public.checkout_gateway_config (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    gateway TEXT NOT NULL CHECK (gateway IN ('abacatepay', 'asaas')),
    is_active BOOLEAN NOT NULL DEFAULT false,
    api_key_configured BOOLEAN NOT NULL DEFAULT false,
    sandbox_mode BOOLEAN NOT NULL DEFAULT true,
    webhook_secret TEXT,
    asaas_wallet_id TEXT,
    asaas_access_token_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, gateway)
);

-- Índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_checkout_gateway_config_user 
ON public.checkout_gateway_config(user_id);

-- Habilitar RLS
ALTER TABLE public.checkout_gateway_config ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - apenas o próprio usuário pode ver/editar
CREATE POLICY "Users can view own gateway config" 
ON public.checkout_gateway_config 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gateway config" 
ON public.checkout_gateway_config 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gateway config" 
ON public.checkout_gateway_config 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Adicionar coluna gateway no checkout_payments
ALTER TABLE public.checkout_payments 
ADD COLUMN IF NOT EXISTS gateway TEXT DEFAULT 'abacatepay';

-- Adicionar coluna asaas_payment_id
ALTER TABLE public.checkout_payments 
ADD COLUMN IF NOT EXISTS asaas_payment_id TEXT;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_gateway_config_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE TRIGGER update_checkout_gateway_config_updated_at
BEFORE UPDATE ON public.checkout_gateway_config
FOR EACH ROW
EXECUTE FUNCTION public.update_gateway_config_updated_at();