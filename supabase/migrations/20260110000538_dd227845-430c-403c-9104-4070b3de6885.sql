-- Insert owner settings for phone verification (using owner's WhatsApp instance)
INSERT INTO owner_settings (setting_key, setting_value, description)
VALUES (
  'phone_verification_config',
  jsonb_build_object(
    'enabled', true,
    'send_via', 'evolution_api',
    'instance_id', '05d8dc41-85f6-4fbb-bb12-7d82534e10cf',
    'backend_url', 'http://72.62.108.24:3000',
    'backend_token', 'genesis-master-token-2024-secure',
    'owner_user_id', '25612428-6f1e-4b99-8642-bc057f4b2936'
  ),
  'Configuração para envio de códigos de verificação via WhatsApp'
)
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  updated_at = now();

-- Create table for owner settings if not exists with proper structure
CREATE TABLE IF NOT EXISTS public.verification_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_type TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL DEFAULT '{}',
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.verification_config ENABLE ROW LEVEL SECURITY;

-- Only service role can access
CREATE POLICY "Service role only access" ON public.verification_config
FOR ALL USING (false);

-- Insert phone verification config
INSERT INTO public.verification_config (config_type, config_value, is_enabled)
VALUES (
  'phone_verification',
  jsonb_build_object(
    'send_via', 'evolution_api',
    'instance_id', '05d8dc41-85f6-4fbb-bb12-7d82534e10cf',
    'backend_url', 'http://72.62.108.24:3000',
    'backend_token', 'genesis-master-token-2024-secure',
    'owner_user_id', '25612428-6f1e-4b99-8642-bc057f4b2936',
    'message_template', '🔐 *Código de Verificação*\n\nOlá {{name}}! 👋\n\nSeu código é: *{{code}}*\n\n⏱️ Válido por 10 minutos.\n🔒 Não compartilhe este código.'
  ),
  true
)
ON CONFLICT (config_type) DO UPDATE SET
  config_value = EXCLUDED.config_value,
  is_enabled = EXCLUDED.is_enabled,
  updated_at = now();