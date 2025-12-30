-- Tabela para armazenar leads de contato
CREATE TABLE public.contact_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  message TEXT,
  plan_interest TEXT NOT NULL DEFAULT 'premium',
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  contacted_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Apenas owner pode gerenciar leads
CREATE POLICY "Owner can view leads" 
ON public.contact_leads 
FOR SELECT 
USING (is_owner(auth.uid()));

CREATE POLICY "Anyone can insert leads" 
ON public.contact_leads 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Owner can update leads" 
ON public.contact_leads 
FOR UPDATE 
USING (is_owner(auth.uid()));

CREATE POLICY "Owner can delete leads" 
ON public.contact_leads 
FOR DELETE 
USING (is_owner(auth.uid()));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_contact_leads_updated_at
BEFORE UPDATE ON public.contact_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir templates padrão para leads (email e whatsapp)
INSERT INTO public.email_templates (name, template_type, subject, html_content, variables, is_active)
VALUES (
  'Confirmação de Lead',
  'lead_confirmation',
  'Obrigado pelo seu interesse na Genesis Hub! 🚀',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #ffffff; padding: 40px; border-radius: 16px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #a855f7; margin: 0;">Genesis Hub</h1>
      <p style="color: #94a3b8; margin-top: 8px;">Sistema de Agendamento Inteligente</p>
    </div>
    <h2 style="color: #ffffff;">Olá, {{nome}}! 👋</h2>
    <p style="color: #cbd5e1; line-height: 1.6;">Recebemos seu interesse no plano <strong style="color: #a855f7;">{{plano}}</strong>!</p>
    <p style="color: #cbd5e1; line-height: 1.6;">Nossa equipe entrará em contato em breve pelo WhatsApp ou email para apresentar todas as funcionalidades e tirar suas dúvidas.</p>
    <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 12px; padding: 20px; margin: 24px 0;">
      <p style="color: #a855f7; font-weight: bold; margin: 0 0 12px 0;">✨ O que você terá acesso:</p>
      <ul style="color: #cbd5e1; margin: 0; padding-left: 20px;">
        <li>Agendamentos ilimitados</li>
        <li>Automação via WhatsApp</li>
        <li>Relatórios avançados</li>
        <li>Suporte prioritário</li>
      </ul>
    </div>
    <p style="color: #64748b; font-size: 14px; margin-top: 30px; text-align: center;">
      Genesis Hub - Transformando a gestão do seu negócio
    </p>
  </div>',
  '["nome", "plano", "email"]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

INSERT INTO public.whatsapp_templates (name, template_type, message_template, is_active)
VALUES (
  'Boas-vindas Lead',
  'lead_welcome',
  'Olá {{nome}}! 👋

Recebemos seu interesse no plano *{{plano}}* da Genesis Hub!

Nossa equipe entrará em contato em breve para apresentar todas as funcionalidades incríveis que vão transformar a gestão do seu negócio.

Enquanto isso, fique à vontade para tirar qualquer dúvida! 🚀

_Equipe Genesis Hub_',
  true
) ON CONFLICT DO NOTHING;