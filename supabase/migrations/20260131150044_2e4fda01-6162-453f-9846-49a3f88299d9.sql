-- Create gym_plans table
CREATE TABLE IF NOT EXISTS public.gym_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  duration_days INTEGER NOT NULL DEFAULT 30,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gym_payments table
CREATE TABLE IF NOT EXISTS public.gym_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES public.gym_plans(id),
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add is_active column to gym_user_roles if not exists
ALTER TABLE public.gym_user_roles ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Enable RLS
ALTER TABLE public.gym_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for gym_plans (public read)
CREATE POLICY "Anyone can view active plans" ON public.gym_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage plans" ON public.gym_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.gym_user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for gym_payments
CREATE POLICY "Users can view own payments" ON public.gym_payments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all payments" ON public.gym_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.gym_user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'instrutor')
    )
  );

CREATE POLICY "Admins can manage payments" ON public.gym_payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.gym_user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Insert sample plans
INSERT INTO public.gym_plans (name, description, price_cents, duration_days, features) VALUES
  ('Mensal', 'Plano mensal básico', 9900, 30, '["Acesso à academia", "Aulas coletivas"]'),
  ('Trimestral', 'Plano trimestral com desconto', 25000, 90, '["Acesso à academia", "Aulas coletivas", "Avaliação física"]'),
  ('Semestral', 'Plano semestral especial', 45000, 180, '["Acesso à academia", "Aulas coletivas", "Avaliação física", "Personal 1x/mês"]'),
  ('Anual', 'Plano anual completo', 80000, 365, '["Acesso ilimitado", "Todas as aulas", "Avaliações mensais", "Personal 2x/mês"]')
ON CONFLICT DO NOTHING;