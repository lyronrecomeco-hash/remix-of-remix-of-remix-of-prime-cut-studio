CREATE TABLE public.intent_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Vínculo com contexto global
  context_id UUID NOT NULL REFERENCES public.global_contexts(id) ON DELETE CASCADE,
  
  -- Tipo de intenção
  intent TEXT NOT NULL
    CHECK (intent IN ('first_contact', 'follow_up', 'objection_handling', 'demo_request', 'closing', 'reactivation')),
  
  -- Conteúdo do template
  base_message TEXT NOT NULL,
  subject_line TEXT,                    -- Para emails
  
  -- Diretrizes de tom
  tone_guidelines TEXT NOT NULL,        -- Instruções de como a IA deve escrever
  opening_style TEXT,                   -- Estilo de saudação
  closing_style TEXT,                   -- Estilo de despedida
  
  -- Restrições
  forbidden_patterns TEXT[],            -- Palavras/frases proibidas
  required_elements TEXT[],             -- Elementos obrigatórios
  max_length INT DEFAULT 500,           -- Limite de caracteres
  
  -- Variáveis dinâmicas permitidas
  allowed_variables JSONB DEFAULT '["{{nome}}", "{{empresa}}", "{{cargo}}"]',
  
  -- Metadados
  is_active BOOLEAN NOT NULL DEFAULT true,
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_intent_templates_context ON public.intent_templates(context_id);
CREATE INDEX idx_intent_templates_intent ON public.intent_templates(intent);
CREATE INDEX idx_intent_templates_active ON public.intent_templates(is_active);
CREATE UNIQUE INDEX idx_intent_templates_unique ON public.intent_templates(context_id, intent) WHERE is_active = true;

-- RLS
ALTER TABLE public.intent_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates são visíveis para todos"
  ON public.intent_templates
  FOR SELECT
  USING (is_active = true);

-- Comentários
COMMENT ON TABLE public.intent_templates IS 'Templates de mensagem por intenção e contexto cultural';
COMMENT ON COLUMN public.intent_templates.intent IS 'first_contact, follow_up, objection_handling, demo_request, closing, reactivation';
COMMENT ON COLUMN public.intent_templates.forbidden_patterns IS 'Padrões que a IA não pode usar (ex: gírias em contextos formais)';