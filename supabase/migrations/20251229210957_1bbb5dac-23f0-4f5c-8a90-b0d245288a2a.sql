-- Create whatsapp_templates table for managing WhatsApp message templates
CREATE TABLE public.whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  message_template TEXT NOT NULL,
  image_url TEXT,
  button_text TEXT,
  button_url TEXT,
  use_ai BOOLEAN DEFAULT false,
  ai_prompt TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- Owner can manage all templates
CREATE POLICY "Owner can manage whatsapp templates"
ON public.whatsapp_templates
FOR ALL
USING (is_owner(auth.uid()))
WITH CHECK (is_owner(auth.uid()));

-- Add phone column to email_confirmation_tokens
ALTER TABLE public.email_confirmation_tokens 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Create trigger for updated_at
CREATE TRIGGER update_whatsapp_templates_updated_at
BEFORE UPDATE ON public.whatsapp_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default welcome template
INSERT INTO public.whatsapp_templates (template_type, name, message_template, is_active)
VALUES (
  'welcome',
  'Boas-vindas após confirmação',
  'Olá {{nome}}! 🎉

Seu email foi confirmado com sucesso!

Seja bem-vindo(a) ao *Barber Studio*! Estamos muito felizes em ter você conosco.

Agende seu primeiro horário e venha conhecer nosso espaço!

_Barber Studio - Tradição e Estilo_',
  true
);