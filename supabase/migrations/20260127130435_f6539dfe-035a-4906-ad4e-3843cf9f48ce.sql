-- Adicionar campo user_type na tabela genesis_subscriptions para diferenciar tipos de usuário
-- Valores: 'client' (pagante), 'influencer' (promocional), 'partner' (parceiro)
ALTER TABLE public.genesis_subscriptions 
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'client';

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.genesis_subscriptions.user_type IS 'Tipo de usuário: client (pagante), influencer (promocional sem pagamento), partner (parceiro sem pagamento)';

-- Adicionar campo commission_rate na tabela promo_links para configurar % de comissão
ALTER TABLE public.promo_links 
ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5,2) DEFAULT 10.00;

-- Adicionar comentário
COMMENT ON COLUMN public.promo_links.commission_rate IS 'Percentual de comissão por indicação convertida';

-- Garantir que promotional_withdrawals tem todos os campos necessários
-- A tabela já existe, apenas verificando se tem os campos corretos

-- Criar índice para busca por status de saque
CREATE INDEX IF NOT EXISTS idx_promotional_withdrawals_status ON public.promotional_withdrawals(status);

-- Criar índice para busca por usuário
CREATE INDEX IF NOT EXISTS idx_promotional_withdrawals_user ON public.promotional_withdrawals(promotional_user_id);