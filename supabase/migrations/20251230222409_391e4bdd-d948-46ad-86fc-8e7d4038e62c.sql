-- Enum para status do afiliado
CREATE TYPE public.affiliate_status AS ENUM ('pending', 'active', 'blocked');

-- Enum para status de comissão/referral
CREATE TYPE public.referral_status AS ENUM ('pending', 'confirmed', 'cancelled', 'paid');

-- Enum para status de saque
CREATE TYPE public.withdrawal_status AS ENUM ('pending', 'processing', 'completed', 'rejected');

-- Enum para tipo de PIX
CREATE TYPE public.pix_type AS ENUM ('cpf', 'cnpj', 'email', 'phone', 'random');

-- Tabela principal de afiliados
CREATE TABLE public.affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  whatsapp TEXT NOT NULL,
  affiliate_code TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  commission_rate_monthly NUMERIC NOT NULL DEFAULT 30,
  commission_rate_lifetime NUMERIC NOT NULL DEFAULT 25,
  pix_key TEXT,
  pix_type public.pix_type,
  status public.affiliate_status NOT NULL DEFAULT 'active',
  total_earnings NUMERIC NOT NULL DEFAULT 0,
  available_balance NUMERIC NOT NULL DEFAULT 0,
  pending_balance NUMERIC NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de referências/vendas via afiliado
CREATE TABLE public.affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT,
  plan_price NUMERIC,
  commission_rate NUMERIC,
  commission_amount NUMERIC,
  status public.referral_status NOT NULL DEFAULT 'pending',
  trial_expires_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de solicitações de saque
CREATE TABLE public.affiliate_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  pix_key TEXT NOT NULL,
  pix_type public.pix_type NOT NULL,
  status public.withdrawal_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  processed_by UUID REFERENCES auth.users(id),
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de cliques no link do afiliado
CREATE TABLE public.affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  landing_page TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de materiais de divulgação
CREATE TABLE public.affiliate_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('banner', 'copy', 'video', 'link')),
  content TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_affiliates_code ON public.affiliates(affiliate_code);
CREATE INDEX idx_affiliates_email ON public.affiliates(email);
CREATE INDEX idx_affiliates_status ON public.affiliates(status);
CREATE INDEX idx_referrals_affiliate ON public.affiliate_referrals(affiliate_id);
CREATE INDEX idx_referrals_user ON public.affiliate_referrals(referred_user_id);
CREATE INDEX idx_referrals_status ON public.affiliate_referrals(status);
CREATE INDEX idx_withdrawals_affiliate ON public.affiliate_withdrawals(affiliate_id);
CREATE INDEX idx_withdrawals_status ON public.affiliate_withdrawals(status);
CREATE INDEX idx_clicks_affiliate ON public.affiliate_clicks(affiliate_id);

-- Enable RLS
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_materials ENABLE ROW LEVEL SECURITY;

-- Função para verificar se é afiliado
CREATE OR REPLACE FUNCTION public.is_affiliate(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.affiliates
    WHERE user_id = _user_id
      AND status = 'active'
  )
$$;

-- Função para obter o ID do afiliado
CREATE OR REPLACE FUNCTION public.get_affiliate_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.affiliates
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS Policies para affiliates
CREATE POLICY "Owner can manage all affiliates"
ON public.affiliates
FOR ALL
USING (is_owner(auth.uid()))
WITH CHECK (is_owner(auth.uid()));

CREATE POLICY "Affiliates can view own data"
ON public.affiliates
FOR SELECT
USING (user_id = auth.uid());

-- RLS Policies para affiliate_referrals
CREATE POLICY "Owner can manage all referrals"
ON public.affiliate_referrals
FOR ALL
USING (is_owner(auth.uid()))
WITH CHECK (is_owner(auth.uid()));

CREATE POLICY "Affiliates can view own referrals"
ON public.affiliate_referrals
FOR SELECT
USING (affiliate_id = get_affiliate_id(auth.uid()));

-- RLS Policies para affiliate_withdrawals
CREATE POLICY "Owner can manage all withdrawals"
ON public.affiliate_withdrawals
FOR ALL
USING (is_owner(auth.uid()))
WITH CHECK (is_owner(auth.uid()));

CREATE POLICY "Affiliates can view own withdrawals"
ON public.affiliate_withdrawals
FOR SELECT
USING (affiliate_id = get_affiliate_id(auth.uid()));

CREATE POLICY "Affiliates can request withdrawals"
ON public.affiliate_withdrawals
FOR INSERT
WITH CHECK (affiliate_id = get_affiliate_id(auth.uid()));

-- RLS Policies para affiliate_clicks
CREATE POLICY "Owner can manage all clicks"
ON public.affiliate_clicks
FOR ALL
USING (is_owner(auth.uid()))
WITH CHECK (is_owner(auth.uid()));

CREATE POLICY "Affiliates can view own clicks"
ON public.affiliate_clicks
FOR SELECT
USING (affiliate_id = get_affiliate_id(auth.uid()));

CREATE POLICY "Anyone can insert clicks"
ON public.affiliate_clicks
FOR INSERT
WITH CHECK (true);

-- RLS Policies para affiliate_materials
CREATE POLICY "Owner can manage materials"
ON public.affiliate_materials
FOR ALL
USING (is_owner(auth.uid()))
WITH CHECK (is_owner(auth.uid()));

CREATE POLICY "Affiliates can view active materials"
ON public.affiliate_materials
FOR SELECT
USING (is_active = true AND is_affiliate(auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER update_affiliates_updated_at
BEFORE UPDATE ON public.affiliates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at
BEFORE UPDATE ON public.affiliate_referrals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_materials_updated_at
BEFORE UPDATE ON public.affiliate_materials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();