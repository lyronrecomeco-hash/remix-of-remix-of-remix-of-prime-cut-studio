-- Create audit_logs table for tracking admin actions
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs (created_at DESC);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs (user_id);

-- Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin')
  )
);

-- Only admins can insert audit logs
CREATE POLICY "Admins can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin')
  )
);

-- Add feedback template to message_templates
INSERT INTO public.message_templates (event_type, title, template, is_active, chatpro_enabled)
VALUES (
  'feedback_request',
  'Solicitação de Avaliação',
  'Olá {{nome_cliente}}! 🌟

Obrigado por visitar a {{nome_barbearia}}!

Gostaríamos muito de saber sua opinião sobre nosso atendimento. Sua avaliação nos ajuda a melhorar sempre!

Clique no link abaixo para nos avaliar:
{{link_avaliacao}}

Agradecemos sua preferência! 💈',
  true,
  true
) ON CONFLICT (event_type) DO UPDATE SET template = EXCLUDED.template;