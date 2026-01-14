CREATE TABLE public.prospecting_message_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referências
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  prospect_id UUID REFERENCES public.affiliate_prospects(id) ON DELETE SET NULL,
  context_id UUID REFERENCES public.global_contexts(id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.intent_templates(id) ON DELETE SET NULL,
  
  -- Contexto usado na geração (snapshot)
  context_snapshot JSONB NOT NULL,      -- ProspectingContext completo usado
  
  -- Mensagem gerada
  intent TEXT NOT NULL,
  generated_message TEXT NOT NULL,
  channel_used TEXT NOT NULL,           -- whatsapp, email, linkedin
  
  -- Detecção automática
  auto_detected_country TEXT,
  auto_detected_language TEXT,
  detection_confidence DECIMAL(3,2),    -- 0.00 a 1.00
  manual_override BOOLEAN DEFAULT false,
  
  -- Resultado
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  
  -- Auditoria
  ai_model_used TEXT,
  tokens_used INT,
  generation_time_ms INT,
  
  -- Metadados
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_message_logs_affiliate ON public.prospecting_message_logs(affiliate_id);
CREATE INDEX idx_message_logs_prospect ON public.prospecting_message_logs(prospect_id);
CREATE INDEX idx_message_logs_context ON public.prospecting_message_logs(context_id);
CREATE INDEX idx_message_logs_created ON public.prospecting_message_logs(created_at DESC);
CREATE INDEX idx_message_logs_intent ON public.prospecting_message_logs(intent);

-- RLS
ALTER TABLE public.prospecting_message_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Afiliados veem seus próprios logs"
  ON public.prospecting_message_logs
  FOR SELECT
  USING (affiliate_id IN (
    SELECT id FROM public.affiliates WHERE user_id = auth.uid()
  ));

CREATE POLICY "Afiliados inserem seus próprios logs"
  ON public.prospecting_message_logs
  FOR INSERT
  WITH CHECK (affiliate_id IN (
    SELECT id FROM public.affiliates WHERE user_id = auth.uid()
  ));

-- Comentários
COMMENT ON TABLE public.prospecting_message_logs IS 'Log de auditoria de mensagens geradas pela IA';
COMMENT ON COLUMN public.prospecting_message_logs.context_snapshot IS 'Snapshot do ProspectingContext usado na geração';
COMMENT ON COLUMN public.prospecting_message_logs.detection_confidence IS 'Confiança da auto-detecção (0.00-1.00)';