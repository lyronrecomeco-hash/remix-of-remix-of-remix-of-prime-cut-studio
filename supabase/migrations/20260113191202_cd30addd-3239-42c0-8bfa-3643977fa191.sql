-- =============================================
-- ProspectAI Genesis - Sistema de Prospecção Inteligente
-- =============================================

-- Tabela de Prospects (leads encontrados para prospectar)
CREATE TABLE public.affiliate_prospects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  
  -- Dados do Estabelecimento
  company_name TEXT NOT NULL,
  company_phone TEXT,
  company_email TEXT,
  company_website TEXT,
  company_address TEXT,
  company_city TEXT,
  company_state TEXT,
  niche TEXT,
  
  -- Análise da Luna
  analysis_data JSONB DEFAULT '{}',
  analysis_score INTEGER DEFAULT 0, -- Score de 0-100 de potencial de conversão
  missing_features TEXT[] DEFAULT '{}', -- Features que faltam (whatsapp, site, agendamento)
  pain_points TEXT[] DEFAULT '{}', -- Dores identificadas
  
  -- Proposta Gerada
  generated_proposal JSONB DEFAULT NULL,
  proposal_generated_at TIMESTAMPTZ DEFAULT NULL,
  
  -- Status do Prospect
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'analyzed', 'proposal_ready', 'sent', 'replied', 'converted', 'rejected', 'failed')),
  
  -- Envio Automatizado
  auto_send_enabled BOOLEAN DEFAULT false,
  scheduled_send_at TIMESTAMPTZ DEFAULT NULL,
  sent_at TIMESTAMPTZ DEFAULT NULL,
  sent_via TEXT, -- 'whatsapp', 'email'
  message_sent TEXT,
  reply_received TEXT,
  reply_received_at TIMESTAMPTZ,
  
  -- Metadados
  source TEXT DEFAULT 'manual', -- 'manual', 'import', 'scraper'
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_affiliate_prospects_affiliate_id ON public.affiliate_prospects(affiliate_id);
CREATE INDEX idx_affiliate_prospects_status ON public.affiliate_prospects(status);
CREATE INDEX idx_affiliate_prospects_score ON public.affiliate_prospects(analysis_score DESC);
CREATE INDEX idx_affiliate_prospects_scheduled ON public.affiliate_prospects(scheduled_send_at) WHERE scheduled_send_at IS NOT NULL;

-- RLS
ALTER TABLE public.affiliate_prospects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view own prospects" 
  ON public.affiliate_prospects FOR SELECT 
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

CREATE POLICY "Affiliates can create own prospects" 
  ON public.affiliate_prospects FOR INSERT 
  WITH CHECK (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

CREATE POLICY "Affiliates can update own prospects" 
  ON public.affiliate_prospects FOR UPDATE 
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

CREATE POLICY "Affiliates can delete own prospects" 
  ON public.affiliate_prospects FOR DELETE 
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

-- =============================================
-- Configurações de Automação Anti-Ban
-- =============================================
CREATE TABLE public.affiliate_prospect_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL UNIQUE REFERENCES public.affiliates(id) ON DELETE CASCADE,
  
  -- Configurações de Envio
  auto_send_enabled BOOLEAN DEFAULT false,
  genesis_instance_id UUID, -- Instância do WhatsApp para envio
  
  -- Horários Permitidos
  send_start_hour INTEGER DEFAULT 8 CHECK (send_start_hour >= 0 AND send_start_hour <= 23),
  send_end_hour INTEGER DEFAULT 20 CHECK (send_end_hour >= 0 AND send_end_hour <= 23),
  send_days INTEGER[] DEFAULT '{1,2,3,4,5}', -- 0=Dom, 1=Seg...6=Sab
  
  -- Limites Anti-Ban
  daily_limit INTEGER DEFAULT 50,
  messages_per_hour INTEGER DEFAULT 10,
  min_delay_seconds INTEGER DEFAULT 30,
  max_delay_seconds INTEGER DEFAULT 120,
  
  -- Warm-up
  warmup_enabled BOOLEAN DEFAULT true,
  warmup_day INTEGER DEFAULT 1,
  warmup_increment_percent INTEGER DEFAULT 20, -- Aumenta 20% por dia
  
  -- Personalização da Mensagem
  message_template TEXT DEFAULT 'Olá! Vi que sua empresa {company_name} pode se beneficiar de automações inteligentes. Preparei uma proposta exclusiva para vocês! 

📊 *Análise Gratuita:*
{analysis_summary}

🚀 *Proposta:*
{proposal_link}

Posso te explicar mais sobre como isso pode aumentar suas vendas?',
  
  include_proposal_link BOOLEAN DEFAULT true,
  include_analysis BOOLEAN DEFAULT true,
  
  -- Métricas
  total_sent_today INTEGER DEFAULT 0,
  total_sent_week INTEGER DEFAULT 0,
  total_sent_month INTEGER DEFAULT 0,
  last_sent_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.affiliate_prospect_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view own settings" 
  ON public.affiliate_prospect_settings FOR SELECT 
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

CREATE POLICY "Affiliates can insert own settings" 
  ON public.affiliate_prospect_settings FOR INSERT 
  WITH CHECK (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

CREATE POLICY "Affiliates can update own settings" 
  ON public.affiliate_prospect_settings FOR UPDATE 
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

-- =============================================
-- Histórico de Envios (para análise e anti-ban)
-- =============================================
CREATE TABLE public.affiliate_prospect_sends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prospect_id UUID NOT NULL REFERENCES public.affiliate_prospects(id) ON DELETE CASCADE,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  
  -- Dados do Envio
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email')),
  message_content TEXT,
  proposal_snapshot JSONB,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sending', 'sent', 'delivered', 'read', 'replied', 'failed', 'blocked')),
  error_message TEXT,
  
  -- Timestamps
  queued_at TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  
  -- Resposta
  reply_content TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_prospect_sends_prospect ON public.affiliate_prospect_sends(prospect_id);
CREATE INDEX idx_prospect_sends_affiliate ON public.affiliate_prospect_sends(affiliate_id);
CREATE INDEX idx_prospect_sends_status ON public.affiliate_prospect_sends(status);
CREATE INDEX idx_prospect_sends_date ON public.affiliate_prospect_sends(created_at DESC);

-- RLS
ALTER TABLE public.affiliate_prospect_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view own sends" 
  ON public.affiliate_prospect_sends FOR SELECT 
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

CREATE POLICY "Affiliates can insert own sends" 
  ON public.affiliate_prospect_sends FOR INSERT 
  WITH CHECK (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER update_affiliate_prospects_updated_at
  BEFORE UPDATE ON public.affiliate_prospects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliate_prospect_settings_updated_at
  BEFORE UPDATE ON public.affiliate_prospect_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();