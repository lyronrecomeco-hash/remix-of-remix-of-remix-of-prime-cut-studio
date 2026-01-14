-- Tabela de contextos globais para prospecção internacional
CREATE TABLE public.global_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação do contexto
  region_code TEXT NOT NULL,            -- LATAM, NA, EU, ASIA
  country_code TEXT NOT NULL,           -- BR, US, DE, FR...
  country_name TEXT NOT NULL,
  
  -- Idioma e localização
  language TEXT NOT NULL,               -- pt-BR, en-US, de-DE
  timezone TEXT NOT NULL,               -- America/Sao_Paulo
  
  -- Perfil cultural
  formality_level INT NOT NULL DEFAULT 3
    CHECK (formality_level BETWEEN 1 AND 5),
  directness_level INT NOT NULL DEFAULT 3
    CHECK (directness_level BETWEEN 1 AND 5),
  emoji_tolerance INT NOT NULL DEFAULT 3
    CHECK (emoji_tolerance BETWEEN 0 AND 5),
  decision_speed TEXT NOT NULL DEFAULT 'medium'
    CHECK (decision_speed IN ('fast', 'medium', 'slow')),
  
  -- Estratégia de contato
  channel_priority JSONB NOT NULL DEFAULT '["email"]',
  business_hours JSONB NOT NULL DEFAULT '{"start": "09:00", "end": "18:00"}',
  
  -- Compliance e restrições legais
  compliance_tags JSONB NOT NULL DEFAULT '[]',
  
  -- Metadados
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_global_contexts_region ON public.global_contexts(region_code);
CREATE INDEX idx_global_contexts_country ON public.global_contexts(country_code);
CREATE INDEX idx_global_contexts_active ON public.global_contexts(is_active);

-- Habilitar RLS
ALTER TABLE public.global_contexts ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública (contextos são dados de referência)
CREATE POLICY "Contextos globais são visíveis para todos"
  ON public.global_contexts
  FOR SELECT
  USING (is_active = true);

-- Comentários para documentação
COMMENT ON TABLE public.global_contexts IS 'Contextos culturais e de compliance para prospecção global';
COMMENT ON COLUMN public.global_contexts.formality_level IS '1=informal, 5=muito formal';
COMMENT ON COLUMN public.global_contexts.directness_level IS '1=indireto, 5=muito direto';
COMMENT ON COLUMN public.global_contexts.emoji_tolerance IS '0=proibido, 5=liberado';
COMMENT ON COLUMN public.global_contexts.decision_speed IS 'Velocidade típica de decisão de compra no país';