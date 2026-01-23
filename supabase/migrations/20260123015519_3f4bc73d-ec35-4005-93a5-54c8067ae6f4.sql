-- =============================================
-- FASE 1: Estrutura de Dados Completa
-- =============================================

-- 1. Criar tabela de planos de checkout
CREATE TABLE public.checkout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- 'monthly', 'quarterly', 'yearly'
  display_name TEXT NOT NULL, -- 'Plano Mensal', etc
  price_cents INTEGER NOT NULL, -- 19700 (R$ 197)
  promo_price_cents INTEGER, -- Valor promocional
  duration_months INTEGER NOT NULL DEFAULT 1,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  discount_percentage INTEGER, -- Ex: 50 para "50% off"
  tagline TEXT, -- "Ideal para começar", etc
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Habilitar RLS
ALTER TABLE public.checkout_plans ENABLE ROW LEVEL SECURITY;

-- 3. Política de leitura pública (planos são públicos)
CREATE POLICY "checkout_plans_select_all" ON public.checkout_plans
  FOR SELECT USING (true);

-- 4. Política de update apenas para admin
CREATE POLICY "checkout_plans_update_admin" ON public.checkout_plans
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "checkout_plans_insert_admin" ON public.checkout_plans
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- 5. Inserir planos padrão
INSERT INTO public.checkout_plans (name, display_name, price_cents, promo_price_cents, duration_months, is_popular, discount_percentage, tagline, features) VALUES
  ('monthly', 'Plano Mensal', 19700, 19700, 1, false, null, 'Ideal para começar', '["Gerador de SaaS Premium Ilimitado", "Gerador de página de vendas", "Prospecte clientes ilimitado", "Suporte exclusivo (WhatsApp)"]'::jsonb),
  ('quarterly', 'Plano Trimestral', 29700, 29700, 3, true, 50, 'Economize 50%', '["Tudo do plano mensal", "Calls semanais ao vivo", "Serviços de Freelancer"]'::jsonb),
  ('yearly', 'Plano Anual', 99700, 69700, 12, false, 58, 'Maior economia!', '["Tudo do plano trimestral", "Acesso prioritário a novidades", "Área de membros exclusiva"]'::jsonb);

-- 6. Adicionar campos em checkout_payments
ALTER TABLE public.checkout_payments
  ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.checkout_plans(id),
  ADD COLUMN IF NOT EXISTS promo_link_id UUID REFERENCES public.promo_links(id),
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'direct';

-- 7. Adicionar campo payment_id em promo_referrals
ALTER TABLE public.promo_referrals
  ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES public.checkout_payments(id);

-- 8. Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_checkout_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_checkout_plans_timestamp
  BEFORE UPDATE ON public.checkout_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_checkout_plans_updated_at();

-- 9. Índices para performance
CREATE INDEX IF NOT EXISTS idx_checkout_payments_plan_id ON public.checkout_payments(plan_id);
CREATE INDEX IF NOT EXISTS idx_checkout_payments_promo_link_id ON public.checkout_payments(promo_link_id);
CREATE INDEX IF NOT EXISTS idx_checkout_payments_source ON public.checkout_payments(source);
CREATE INDEX IF NOT EXISTS idx_promo_referrals_payment_id ON public.promo_referrals(payment_id);