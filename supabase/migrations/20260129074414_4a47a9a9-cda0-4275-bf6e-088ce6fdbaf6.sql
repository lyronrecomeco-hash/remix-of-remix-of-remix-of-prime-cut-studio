-- ===========================================
-- SISTEMA DE ENRIQUECIMENTO DE LEADS
-- Tabelas para validação, análise e cache
-- ===========================================

-- 1. Cache geral de enriquecimento
CREATE TABLE IF NOT EXISTS public.enrichment_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  cache_type TEXT NOT NULL, -- 'email', 'phone', 'website', 'ads', 'ai_score'
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  hit_count INTEGER DEFAULT 0
);

-- Índices para performance de cache
CREATE INDEX IF NOT EXISTS idx_enrichment_cache_key ON public.enrichment_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_enrichment_cache_expires ON public.enrichment_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_enrichment_cache_type ON public.enrichment_cache(cache_type);

-- 2. Validações de contato (email/telefone)
CREATE TABLE IF NOT EXISTS public.lead_validations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_value TEXT NOT NULL, -- email ou telefone
  contact_type TEXT NOT NULL, -- 'email' ou 'phone'
  is_valid BOOLEAN DEFAULT false,
  validation_details JSONB DEFAULT '{}',
  -- Para email
  email_syntax_valid BOOLEAN,
  email_mx_valid BOOLEAN,
  email_is_disposable BOOLEAN,
  email_is_catch_all BOOLEAN,
  email_provider TEXT,
  -- Para telefone
  phone_is_mobile BOOLEAN,
  phone_has_whatsapp BOOLEAN,
  phone_carrier TEXT,
  phone_country_code TEXT,
  phone_formatted TEXT,
  -- Timestamps
  validated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_lead_validations_contact ON public.lead_validations(contact_value, contact_type);
CREATE INDEX IF NOT EXISTS idx_lead_validations_type ON public.lead_validations(contact_type);
CREATE INDEX IF NOT EXISTS idx_lead_validations_expires ON public.lead_validations(expires_at);

-- 3. Health check de websites
CREATE TABLE IF NOT EXISTS public.website_health_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  -- Status HTTP
  http_status INTEGER,
  is_accessible BOOLEAN DEFAULT false,
  response_time_ms INTEGER,
  -- SSL
  has_ssl BOOLEAN,
  ssl_valid BOOLEAN,
  ssl_expires_at TIMESTAMP WITH TIME ZONE,
  -- Tecnologias detectadas
  technologies JSONB DEFAULT '[]',
  cms_detected TEXT, -- 'wordpress', 'wix', 'shopify', etc.
  -- Presença digital
  has_meta_pixel BOOLEAN DEFAULT false,
  has_google_tag BOOLEAN DEFAULT false,
  has_google_analytics BOOLEAN DEFAULT false,
  -- Metadados
  page_title TEXT,
  meta_description TEXT,
  -- Status geral
  health_score INTEGER, -- 0-100
  health_status TEXT, -- 'healthy', 'issues', 'critical', 'offline'
  -- Timestamps
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_website_health_domain ON public.website_health_checks(domain);
CREATE INDEX IF NOT EXISTS idx_website_health_expires ON public.website_health_checks(expires_at);
CREATE INDEX IF NOT EXISTS idx_website_health_status ON public.website_health_checks(health_status);

-- 4. Análise de anúncios
CREATE TABLE IF NOT EXISTS public.lead_ads_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  business_domain TEXT,
  -- Meta Ads (Facebook/Instagram)
  has_meta_ads BOOLEAN DEFAULT false,
  meta_ads_count INTEGER DEFAULT 0,
  meta_ads_status TEXT DEFAULT 'unknown', -- 'active', 'paused_recently', 'inactive', 'unknown'
  meta_ads_details JSONB DEFAULT '[]',
  meta_pixel_detected BOOLEAN DEFAULT false,
  -- Google Ads
  has_google_ads BOOLEAN DEFAULT false,
  google_ads_count INTEGER DEFAULT 0,
  google_ads_status TEXT DEFAULT 'unknown',
  google_ads_details JSONB DEFAULT '[]',
  google_tag_detected BOOLEAN DEFAULT false,
  -- Análise consolidada
  ad_platforms TEXT[] DEFAULT '{}', -- ['meta', 'google']
  overall_ad_status TEXT DEFAULT 'unknown', -- 'active', 'paused_recently', 'inactive', 'unknown'
  campaign_types TEXT[] DEFAULT '{}', -- ['branding', 'traffic', 'conversion', 'leads', 'ecommerce']
  investment_indicator TEXT DEFAULT 'unknown', -- 'recurring', 'sporadic', 'none', 'unknown'
  estimated_monthly_spend TEXT, -- 'low', 'medium', 'high', 'unknown'
  -- Timestamps
  last_ad_detected_at TIMESTAMP WITH TIME ZONE,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_ads_business ON public.lead_ads_analysis(business_name);
CREATE INDEX IF NOT EXISTS idx_lead_ads_domain ON public.lead_ads_analysis(business_domain);
CREATE INDEX IF NOT EXISTS idx_lead_ads_expires ON public.lead_ads_analysis(expires_at);
CREATE INDEX IF NOT EXISTS idx_lead_ads_status ON public.lead_ads_analysis(overall_ad_status);

-- 5. Leads enriquecidos (consolidação final)
CREATE TABLE IF NOT EXISTS public.enriched_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Identificação
  affiliate_id UUID REFERENCES public.affiliates(id),
  source TEXT NOT NULL, -- 'radar', 'encontrar_cliente', 'manual'
  external_id TEXT, -- place_id do Google, etc.
  -- Dados básicos
  business_name TEXT NOT NULL,
  business_address TEXT,
  business_city TEXT,
  business_state TEXT,
  business_country TEXT,
  business_phone TEXT,
  business_email TEXT,
  business_website TEXT,
  business_niche TEXT,
  google_rating NUMERIC(2,1),
  google_reviews_count INTEGER,
  -- Referências às análises
  validation_id UUID REFERENCES public.lead_validations(id),
  website_health_id UUID REFERENCES public.website_health_checks(id),
  ads_analysis_id UUID REFERENCES public.lead_ads_analysis(id),
  -- Dados de validação inline (para acesso rápido)
  email_is_valid BOOLEAN,
  phone_is_valid BOOLEAN,
  phone_has_whatsapp BOOLEAN,
  website_is_healthy BOOLEAN,
  has_active_ads BOOLEAN,
  -- Score e análise IA
  opportunity_score INTEGER, -- 0-100
  opportunity_level TEXT, -- 'hot', 'warm', 'cool', 'cold'
  ai_analysis JSONB DEFAULT '{}',
  pain_points TEXT[] DEFAULT '{}',
  recommended_services TEXT[] DEFAULT '{}',
  suggested_pitch TEXT,
  -- Presença digital consolidada
  digital_presence_score INTEGER, -- 0-100
  digital_presence_status TEXT,
  -- Valores estimados
  estimated_value_min INTEGER,
  estimated_value_max INTEGER,
  monthly_recurrence INTEGER,
  -- Status do lead
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'interested', 'converted', 'rejected'
  contacted_at TIMESTAMP WITH TIME ZONE,
  contacted_via TEXT,
  -- Timestamps
  enriched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_enriched_leads_affiliate ON public.enriched_leads(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_enriched_leads_external ON public.enriched_leads(external_id);
CREATE INDEX IF NOT EXISTS idx_enriched_leads_business ON public.enriched_leads(business_name);
CREATE INDEX IF NOT EXISTS idx_enriched_leads_score ON public.enriched_leads(opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_enriched_leads_level ON public.enriched_leads(opportunity_level);
CREATE INDEX IF NOT EXISTS idx_enriched_leads_status ON public.enriched_leads(status);
CREATE INDEX IF NOT EXISTS idx_enriched_leads_expires ON public.enriched_leads(expires_at);

-- Enable RLS
ALTER TABLE public.enrichment_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_ads_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enriched_leads ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para cache (sem autenticação necessária)
CREATE POLICY "Cache is publicly accessible" ON public.enrichment_cache FOR ALL USING (true);
CREATE POLICY "Validations are publicly accessible" ON public.lead_validations FOR ALL USING (true);
CREATE POLICY "Website checks are publicly accessible" ON public.website_health_checks FOR ALL USING (true);
CREATE POLICY "Ads analysis is publicly accessible" ON public.lead_ads_analysis FOR ALL USING (true);

-- Política para enriched_leads (vinculado ao afiliado)
CREATE POLICY "Users can view their enriched leads" ON public.enriched_leads 
  FOR SELECT USING (true);

CREATE POLICY "Users can insert enriched leads" ON public.enriched_leads 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update enriched leads" ON public.enriched_leads 
  FOR UPDATE USING (true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_enriched_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_enriched_leads_updated_at
  BEFORE UPDATE ON public.enriched_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_enriched_leads_updated_at();

-- Função para limpar cache expirado
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM public.enrichment_cache WHERE expires_at < now();
  DELETE FROM public.lead_validations WHERE expires_at < now();
  DELETE FROM public.website_health_checks WHERE expires_at < now();
  DELETE FROM public.lead_ads_analysis WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;