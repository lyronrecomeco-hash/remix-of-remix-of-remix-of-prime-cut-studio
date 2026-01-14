-- Tabela para armazenar configurações de templates personalizados
CREATE TABLE public.affiliate_template_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  template_slug TEXT NOT NULL,
  template_name TEXT NOT NULL,
  unique_code TEXT NOT NULL UNIQUE,
  client_name TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  views_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_affiliate_template_configs_affiliate_id ON public.affiliate_template_configs(affiliate_id);
CREATE INDEX idx_affiliate_template_configs_unique_code ON public.affiliate_template_configs(unique_code);
CREATE INDEX idx_affiliate_template_configs_template_slug ON public.affiliate_template_configs(template_slug);

-- Enable RLS
ALTER TABLE public.affiliate_template_configs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Affiliates can view their own template configs"
ON public.affiliate_template_configs
FOR SELECT
USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

CREATE POLICY "Affiliates can create their own template configs"
ON public.affiliate_template_configs
FOR INSERT
WITH CHECK (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

CREATE POLICY "Affiliates can update their own template configs"
ON public.affiliate_template_configs
FOR UPDATE
USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

CREATE POLICY "Affiliates can delete their own template configs"
ON public.affiliate_template_configs
FOR DELETE
USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

-- Política pública para visualização de demos (qualquer pessoa pode ver pelo unique_code)
CREATE POLICY "Anyone can view active template configs by unique_code"
ON public.affiliate_template_configs
FOR SELECT
USING (is_active = true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_affiliate_template_configs_updated_at
BEFORE UPDATE ON public.affiliate_template_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();