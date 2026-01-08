-- =============================================
-- GENESIS ECONOMY SYSTEM - Enterprise Grade
-- =============================================

-- 1. SUBSCRIPTION PLANS (Planos configuráveis pelo Owner)
CREATE TABLE public.genesis_economy_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_recommended BOOLEAN DEFAULT false,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly', 'lifetime')),
  
  -- Credits included
  credits_included INTEGER NOT NULL DEFAULT 0,
  
  -- Limits
  max_instances INTEGER NOT NULL DEFAULT 1,
  max_flows INTEGER NOT NULL DEFAULT 5,
  max_messages_month INTEGER NOT NULL DEFAULT 1000,
  max_ai_calls_month INTEGER NOT NULL DEFAULT 100,
  max_webhooks INTEGER NOT NULL DEFAULT 5,
  
  -- Features (JSON for flexibility)
  features_enabled JSONB NOT NULL DEFAULT '{"chatbot": true, "flow_builder": false, "luna_ai": false, "templates": false, "priority_support": false}'::jsonb,
  
  -- Overusage behavior
  overusage_behavior TEXT NOT NULL DEFAULT 'block' CHECK (overusage_behavior IN ('block', 'charge_credits', 'suggest_upgrade')),
  
  -- Processing priority (1-10, higher = faster)
  processing_priority INTEGER NOT NULL DEFAULT 5 CHECK (processing_priority BETWEEN 1 AND 10),
  
  -- Display order
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. CREDIT PACKAGES (Pacotes de créditos avulsos)
CREATE TABLE public.genesis_economy_credit_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  credits_amount INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  price_per_credit DECIMAL(10,4) GENERATED ALWAYS AS (price / NULLIF(credits_amount, 0)) STORED,
  bonus_credits INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_recommended BOOLEAN DEFAULT false,
  is_not_recommended BOOLEAN DEFAULT false,
  expiration_days INTEGER,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. CONSUMPTION RULES (Regras de consumo por ação)
CREATE TABLE public.genesis_economy_consumption_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action_type TEXT NOT NULL UNIQUE,
  action_label TEXT NOT NULL,
  credits_cost DECIMAL(10,4) NOT NULL DEFAULT 1,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority_source TEXT NOT NULL DEFAULT 'plan_first' CHECK (priority_source IN ('plan_first', 'credits_first', 'plan_only', 'credits_only')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. USER SUBSCRIPTIONS (Assinaturas ativas dos usuários)
CREATE TABLE public.genesis_economy_user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.genesis_users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.genesis_economy_plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended', 'trial')),
  
  -- Period
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- Usage tracking (reset monthly)
  messages_used INTEGER NOT NULL DEFAULT 0,
  ai_calls_used INTEGER NOT NULL DEFAULT 0,
  flow_executions_used INTEGER NOT NULL DEFAULT 0,
  webhooks_used INTEGER NOT NULL DEFAULT 0,
  usage_reset_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- External payment reference
  external_subscription_id TEXT,
  external_customer_id TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. USER CREDITS (Saldo de créditos dos usuários)
CREATE TABLE public.genesis_economy_user_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.genesis_users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES public.genesis_economy_credit_packages(id),
  
  credits_purchased INTEGER NOT NULL DEFAULT 0,
  credits_bonus INTEGER NOT NULL DEFAULT 0,
  credits_used INTEGER NOT NULL DEFAULT 0,
  credits_available INTEGER GENERATED ALWAYS AS (credits_purchased + credits_bonus - credits_used) STORED,
  
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Payment reference
  external_payment_id TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. CONSUMPTION LOG (Log imutável de consumo)
CREATE TABLE public.genesis_economy_consumption_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.genesis_users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  credits_consumed DECIMAL(10,4) NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('plan', 'credits', 'bonus')),
  source_id UUID,
  
  -- Context
  instance_id UUID,
  chatbot_id UUID,
  flow_id UUID,
  
  -- Metadata
  metadata JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. ECONOMY ANALYTICS (Agregações para dashboard)
CREATE TABLE public.genesis_economy_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  metric_type TEXT NOT NULL,
  metric_value DECIMAL(15,4) NOT NULL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_daily_metric UNIQUE (date, metric_type)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_economy_user_subscriptions_user ON public.genesis_economy_user_subscriptions(user_id);
CREATE INDEX idx_economy_user_subscriptions_status ON public.genesis_economy_user_subscriptions(status);
CREATE INDEX idx_economy_user_credits_user ON public.genesis_economy_user_credits(user_id);
CREATE INDEX idx_economy_consumption_log_user ON public.genesis_economy_consumption_log(user_id);
CREATE INDEX idx_economy_consumption_log_created ON public.genesis_economy_consumption_log(created_at);
CREATE INDEX idx_economy_consumption_log_action ON public.genesis_economy_consumption_log(action_type);
CREATE INDEX idx_economy_analytics_date ON public.genesis_economy_analytics(date);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.genesis_economy_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_economy_credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_economy_consumption_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_economy_user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_economy_user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_economy_consumption_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_economy_analytics ENABLE ROW LEVEL SECURITY;

-- Plans: Public read, super_admin write
CREATE POLICY "Anyone can view active plans" ON public.genesis_economy_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Super admin can manage plans" ON public.genesis_economy_plans FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
);

-- Credit Packages: Public read, super_admin write
CREATE POLICY "Anyone can view active packages" ON public.genesis_economy_credit_packages FOR SELECT USING (is_active = true);
CREATE POLICY "Super admin can manage packages" ON public.genesis_economy_credit_packages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
);

-- Consumption Rules: Public read, super_admin write
CREATE POLICY "Anyone can view active rules" ON public.genesis_economy_consumption_rules FOR SELECT USING (is_active = true);
CREATE POLICY "Super admin can manage rules" ON public.genesis_economy_consumption_rules FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
);

-- User Subscriptions: User can view own, super_admin all
CREATE POLICY "Users can view own subscription" ON public.genesis_economy_user_subscriptions FOR SELECT USING (
  user_id IN (SELECT id FROM public.genesis_users WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Super admin can manage subscriptions" ON public.genesis_economy_user_subscriptions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
);

-- User Credits: User can view own, super_admin all
CREATE POLICY "Users can view own credits" ON public.genesis_economy_user_credits FOR SELECT USING (
  user_id IN (SELECT id FROM public.genesis_users WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Super admin can manage credits" ON public.genesis_economy_user_credits FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
);

-- Consumption Log: User can view own, super_admin all
CREATE POLICY "Users can view own consumption" ON public.genesis_economy_consumption_log FOR SELECT USING (
  user_id IN (SELECT id FROM public.genesis_users WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Super admin can view all consumption" ON public.genesis_economy_consumption_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "System can insert consumption" ON public.genesis_economy_consumption_log FOR INSERT WITH CHECK (true);

-- Analytics: Super admin only
CREATE POLICY "Super admin can view analytics" ON public.genesis_economy_analytics FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "Super admin can manage analytics" ON public.genesis_economy_analytics FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
);

-- =============================================
-- DEFAULT DATA
-- =============================================

-- Default Consumption Rules
INSERT INTO public.genesis_economy_consumption_rules (action_type, action_label, credits_cost, description) VALUES
('whatsapp_message_sent', 'Mensagem WhatsApp Enviada', 1.0, 'Cada mensagem enviada via WhatsApp'),
('whatsapp_message_received', 'Mensagem WhatsApp Recebida', 0.5, 'Cada mensagem recebida (processamento)'),
('ai_response', 'Resposta IA (Luna)', 3.0, 'Cada resposta gerada pela Luna IA'),
('flow_execution', 'Execução de Flow', 2.0, 'Cada execução completa de um fluxo'),
('webhook_call', 'Chamada Webhook', 1.5, 'Cada chamada de webhook externo'),
('ai_analysis', 'Análise de IA', 5.0, 'Análise complexa com IA (propostas, etc)');

-- Default Plans
INSERT INTO public.genesis_economy_plans (name, slug, description, price_monthly, credits_included, max_instances, max_flows, max_messages_month, max_ai_calls_month, max_webhooks, features_enabled, is_recommended, display_order) VALUES
('Free', 'free', 'Comece gratuitamente', 0, 100, 1, 2, 500, 50, 2, '{"chatbot": true, "flow_builder": false, "luna_ai": false, "templates": false, "priority_support": false}', false, 1),
('Starter', 'starter', 'Para pequenos negócios', 49.90, 500, 2, 5, 2000, 200, 5, '{"chatbot": true, "flow_builder": true, "luna_ai": false, "templates": true, "priority_support": false}', false, 2),
('Pro', 'pro', 'Para empresas em crescimento', 149.90, 2000, 5, 20, 10000, 1000, 20, '{"chatbot": true, "flow_builder": true, "luna_ai": true, "templates": true, "priority_support": true}', true, 3),
('Enterprise', 'enterprise', 'Para grandes operações', 499.90, 10000, 20, 100, 50000, 5000, 100, '{"chatbot": true, "flow_builder": true, "luna_ai": true, "templates": true, "priority_support": true}', false, 4);

-- Default Credit Packages
INSERT INTO public.genesis_economy_credit_packages (name, credits_amount, price, bonus_credits, is_recommended, is_not_recommended, display_order) VALUES
('Básico', 100, 19.90, 0, false, true, 1),
('Popular', 500, 79.90, 50, true, false, 2),
('Profissional', 1000, 149.90, 150, false, false, 3),
('Enterprise', 5000, 599.90, 1000, false, false, 4);

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_genesis_economy_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_genesis_economy_plans_updated_at BEFORE UPDATE ON public.genesis_economy_plans FOR EACH ROW EXECUTE FUNCTION public.update_genesis_economy_updated_at();
CREATE TRIGGER update_genesis_economy_credit_packages_updated_at BEFORE UPDATE ON public.genesis_economy_credit_packages FOR EACH ROW EXECUTE FUNCTION public.update_genesis_economy_updated_at();
CREATE TRIGGER update_genesis_economy_consumption_rules_updated_at BEFORE UPDATE ON public.genesis_economy_consumption_rules FOR EACH ROW EXECUTE FUNCTION public.update_genesis_economy_updated_at();
CREATE TRIGGER update_genesis_economy_user_subscriptions_updated_at BEFORE UPDATE ON public.genesis_economy_user_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_genesis_economy_updated_at();