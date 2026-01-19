-- Tabela para links promocionais dos usuários
CREATE TABLE public.promo_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  affiliate_id UUID REFERENCES public.affiliates(id),
  promo_code VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para indicados via link promocional
CREATE TABLE public.promo_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  promo_link_id UUID NOT NULL REFERENCES public.promo_links(id) ON DELETE CASCADE,
  referred_user_id UUID,
  referred_name VARCHAR(255),
  referred_email VARCHAR(255),
  plan_type VARCHAR(50) NOT NULL, -- 'monthly_promo' ou 'yearly_promo'
  plan_value NUMERIC(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'pending'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_promo_links_user_id ON public.promo_links(user_id);
CREATE INDEX idx_promo_links_promo_code ON public.promo_links(promo_code);
CREATE INDEX idx_promo_referrals_promo_link_id ON public.promo_referrals(promo_link_id);

-- Enable RLS
ALTER TABLE public.promo_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_referrals ENABLE ROW LEVEL SECURITY;

-- Políticas para promo_links
CREATE POLICY "Users can view their own promo links"
ON public.promo_links
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own promo links"
ON public.promo_links
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own promo links"
ON public.promo_links
FOR UPDATE
USING (auth.uid() = user_id);

-- Políticas para promo_referrals - usuários veem referrals dos seus links
CREATE POLICY "Users can view referrals from their promo links"
ON public.promo_referrals
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.promo_links pl
    WHERE pl.id = promo_link_id AND pl.user_id = auth.uid()
  )
);

-- Política pública para inserir referrals (quando alguém compra via link promo)
CREATE POLICY "Anyone can create referrals"
ON public.promo_referrals
FOR INSERT
WITH CHECK (true);

-- Política para leitura pública de promo_links (necessário para página /promo/{codigo})
CREATE POLICY "Public can read promo links by code"
ON public.promo_links
FOR SELECT
USING (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_promo_links_updated_at
BEFORE UPDATE ON public.promo_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promo_referrals_updated_at
BEFORE UPDATE ON public.promo_referrals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();