-- =============================================
-- CHECKOUT SYSTEM - ISOLATED PAYMENT TABLES
-- =============================================

-- Tabela de clientes do checkout (isolada do sistema principal)
CREATE TABLE public.checkout_customers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    phone_country_code TEXT NOT NULL DEFAULT '+55',
    cpf TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índice para busca por CPF
CREATE INDEX idx_checkout_customers_cpf ON public.checkout_customers(cpf);
CREATE INDEX idx_checkout_customers_email ON public.checkout_customers(email);

-- Tabela principal de pagamentos
CREATE TABLE public.checkout_payments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    payment_code TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.checkout_customers(id),
    
    -- Dados do pagamento
    amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'BRL',
    description TEXT,
    
    -- Integração AbacatePay
    abacatepay_billing_id TEXT,
    abacatepay_url TEXT,
    
    -- PIX específico
    pix_br_code TEXT,
    pix_qr_code_base64 TEXT,
    
    -- Cartão específico
    card_last_four TEXT,
    card_brand TEXT,
    installments INTEGER DEFAULT 1,
    
    -- Status e controle
    payment_method TEXT CHECK (payment_method IN ('PIX', 'CARD')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired', 'failed', 'refunded', 'cancelled')),
    
    -- Timestamps
    expires_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Metadados
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT
);

-- Índices para performance
CREATE INDEX idx_checkout_payments_code ON public.checkout_payments(payment_code);
CREATE INDEX idx_checkout_payments_status ON public.checkout_payments(status);
CREATE INDEX idx_checkout_payments_abacate_id ON public.checkout_payments(abacatepay_billing_id);
CREATE INDEX idx_checkout_payments_expires ON public.checkout_payments(expires_at) WHERE status = 'pending';

-- Tabela de eventos de pagamento (audit trail)
CREATE TABLE public.checkout_payment_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    payment_id UUID NOT NULL REFERENCES public.checkout_payments(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    source TEXT DEFAULT 'system' CHECK (source IN ('system', 'webhook', 'polling', 'manual')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_checkout_events_payment ON public.checkout_payment_events(payment_id);
CREATE INDEX idx_checkout_events_type ON public.checkout_payment_events(event_type);

-- Tabela de configuração do webhook
CREATE TABLE public.checkout_webhook_config (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    webhook_secret TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_received_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.checkout_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_webhook_config ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para checkout (acesso anônimo para criar pagamentos)
CREATE POLICY "Allow public to create customers" 
ON public.checkout_customers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public to read own customer by id" 
ON public.checkout_customers 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public to create payments" 
ON public.checkout_payments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public to read payments by code" 
ON public.checkout_payments 
FOR SELECT 
USING (true);

CREATE POLICY "Allow service role to update payments" 
ON public.checkout_payments 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public to read payment events" 
ON public.checkout_payment_events 
FOR SELECT 
USING (true);

CREATE POLICY "Allow service role to insert events" 
ON public.checkout_payment_events 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow service role to manage webhook config" 
ON public.checkout_webhook_config 
FOR ALL 
USING (true);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_checkout_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers para updated_at
CREATE TRIGGER update_checkout_customers_updated_at
BEFORE UPDATE ON public.checkout_customers
FOR EACH ROW
EXECUTE FUNCTION public.update_checkout_updated_at();

CREATE TRIGGER update_checkout_payments_updated_at
BEFORE UPDATE ON public.checkout_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_checkout_updated_at();

-- Função para gerar payment_code único
CREATE OR REPLACE FUNCTION public.generate_payment_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..12 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN 'PAY-' || substr(result, 1, 4) || '-' || substr(result, 5, 4) || '-' || substr(result, 9, 4);
END;
$$ LANGUAGE plpgsql SET search_path = public;