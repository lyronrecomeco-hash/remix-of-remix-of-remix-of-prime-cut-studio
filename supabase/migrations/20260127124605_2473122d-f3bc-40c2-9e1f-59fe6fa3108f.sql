-- Tabela de usuários promocionais (influenciadores/parceiros)
CREATE TABLE public.promotional_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('influencer', 'partner')),
  available_balance DECIMAL(10,2) DEFAULT 0,
  pending_balance DECIMAL(10,2) DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  commission_rate DECIMAL(5,2) DEFAULT 10,
  referral_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de saques promocionais
CREATE TABLE public.promotional_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotional_user_id UUID REFERENCES public.promotional_users(id) ON DELETE CASCADE NOT NULL,
  holder_name TEXT NOT NULL,
  pix_type TEXT NOT NULL CHECK (pix_type IN ('cpf', 'cnpj', 'email', 'phone', 'random')),
  pix_key TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 100),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID,
  notes TEXT
);

-- Tabela de configurações promocionais (Owner)
CREATE TABLE public.promotional_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  default_commission_rate DECIMAL(5,2) DEFAULT 10,
  min_withdrawal_amount DECIMAL(10,2) DEFAULT 100,
  max_withdrawal_amount DECIMAL(10,2) DEFAULT 10000,
  withdrawal_processing_days INTEGER DEFAULT 1,
  updated_by UUID,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir configuração padrão
INSERT INTO public.promotional_settings (default_commission_rate, min_withdrawal_amount) 
VALUES (10, 100);

-- Enable RLS
ALTER TABLE public.promotional_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotional_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotional_settings ENABLE ROW LEVEL SECURITY;

-- Policies para promotional_users
CREATE POLICY "Super admins can manage promotional users"
ON public.promotional_users
FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Promotional users can view own data"
ON public.promotional_users
FOR SELECT
USING (user_id = auth.uid());

-- Policies para promotional_withdrawals
CREATE POLICY "Super admins can manage withdrawals"
ON public.promotional_withdrawals
FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Promotional users can view own withdrawals"
ON public.promotional_withdrawals
FOR SELECT
USING (
  promotional_user_id IN (
    SELECT id FROM public.promotional_users WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Promotional users can create withdrawals"
ON public.promotional_withdrawals
FOR INSERT
WITH CHECK (
  promotional_user_id IN (
    SELECT id FROM public.promotional_users WHERE user_id = auth.uid()
  )
);

-- Policies para promotional_settings
CREATE POLICY "Super admins can manage settings"
ON public.promotional_settings
FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Anyone can view settings"
ON public.promotional_settings
FOR SELECT
USING (true);

-- Trigger para updated_at
CREATE TRIGGER update_promotional_users_updated_at
BEFORE UPDATE ON public.promotional_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();