-- =============================================
-- RADAR GLOBAL: Sistema de Prospecção Automática
-- =============================================

-- Tabela de oportunidades encontradas automaticamente
CREATE TABLE public.global_radar_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  
  -- Dados da empresa
  company_name TEXT NOT NULL,
  company_phone TEXT,
  company_email TEXT,
  company_website TEXT,
  company_address TEXT,
  company_city TEXT,
  company_state TEXT,
  company_country TEXT,
  niche TEXT,
  
  -- Análise AI
  opportunity_score INTEGER DEFAULT 0, -- 0-100
  opportunity_level TEXT DEFAULT 'basic', -- basic, intermediate, advanced
  estimated_value_min INTEGER DEFAULT 0,
  estimated_value_max INTEGER DEFAULT 0,
  monthly_recurrence INTEGER DEFAULT 0,
  
  -- Presença digital
  has_website BOOLEAN DEFAULT false,
  has_whatsapp BOOLEAN DEFAULT false,
  has_online_scheduling BOOLEAN DEFAULT false,
  has_chatbot BOOLEAN DEFAULT false,
  digital_presence_status TEXT, -- "Sem presença digital", "Presença básica", etc
  
  -- Tags e análise
  service_tags TEXT[] DEFAULT '{}',
  ai_description TEXT,
  pain_points TEXT[] DEFAULT '{}',
  missing_features TEXT[] DEFAULT '{}',
  
  -- Proposta gerada
  generated_proposal JSONB,
  proposal_generated_at TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'new', -- new, viewed, accepted, rejected, converted
  is_read BOOLEAN DEFAULT false,
  accepted_at TIMESTAMPTZ,
  
  -- Metadados
  source TEXT DEFAULT 'radar', -- radar, manual
  search_region TEXT, -- ex: "USA", "Europe", "Latin America"
  found_at TIMESTAMPTZ DEFAULT now(),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_radar_opportunities_affiliate ON global_radar_opportunities(affiliate_id);
CREATE INDEX idx_radar_opportunities_status ON global_radar_opportunities(status);
CREATE INDEX idx_radar_opportunities_is_read ON global_radar_opportunities(is_read);
CREATE INDEX idx_radar_opportunities_score ON global_radar_opportunities(opportunity_score DESC);

-- Configurações do Radar por afiliado
CREATE TABLE public.global_radar_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL UNIQUE REFERENCES public.affiliates(id) ON DELETE CASCADE,
  
  -- Configurações de busca
  is_enabled BOOLEAN DEFAULT true,
  search_regions TEXT[] DEFAULT '{"BR", "US", "PT", "ES"}',
  target_niches TEXT[] DEFAULT '{"barbearia", "salao", "clinica", "restaurante"}',
  
  -- Filtros
  min_opportunity_score INTEGER DEFAULT 60,
  exclude_with_website BOOLEAN DEFAULT false,
  
  -- Limites
  max_opportunities_per_day INTEGER DEFAULT 50,
  opportunities_found_today INTEGER DEFAULT 0,
  
  -- Última execução
  last_scan_at TIMESTAMPTZ,
  next_scan_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.global_radar_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_radar_settings ENABLE ROW LEVEL SECURITY;

-- Affiliates podem ver suas próprias oportunidades
CREATE POLICY "Affiliates can view their own radar opportunities" 
ON public.global_radar_opportunities 
FOR SELECT 
USING (
  affiliate_id IN (
    SELECT id FROM public.affiliates WHERE user_id = auth.uid()
  )
);

-- Affiliates podem atualizar suas próprias oportunidades
CREATE POLICY "Affiliates can update their own radar opportunities" 
ON public.global_radar_opportunities 
FOR UPDATE 
USING (
  affiliate_id IN (
    SELECT id FROM public.affiliates WHERE user_id = auth.uid()
  )
);

-- Affiliates podem deletar suas próprias oportunidades
CREATE POLICY "Affiliates can delete their own radar opportunities" 
ON public.global_radar_opportunities 
FOR DELETE 
USING (
  affiliate_id IN (
    SELECT id FROM public.affiliates WHERE user_id = auth.uid()
  )
);

-- Service role pode inserir (para edge functions)
CREATE POLICY "Service role can insert radar opportunities" 
ON public.global_radar_opportunities 
FOR INSERT 
WITH CHECK (true);

-- Settings policies
CREATE POLICY "Affiliates can view their own radar settings" 
ON public.global_radar_settings 
FOR SELECT 
USING (
  affiliate_id IN (
    SELECT id FROM public.affiliates WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Affiliates can update their own radar settings" 
ON public.global_radar_settings 
FOR UPDATE 
USING (
  affiliate_id IN (
    SELECT id FROM public.affiliates WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Affiliates can insert their own radar settings" 
ON public.global_radar_settings 
FOR INSERT 
WITH CHECK (
  affiliate_id IN (
    SELECT id FROM public.affiliates WHERE user_id = auth.uid()
  )
);

-- Trigger para updated_at
CREATE TRIGGER update_global_radar_opportunities_updated_at
  BEFORE UPDATE ON public.global_radar_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_global_radar_settings_updated_at
  BEFORE UPDATE ON public.global_radar_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();