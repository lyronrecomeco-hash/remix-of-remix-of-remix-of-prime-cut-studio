-- Adicionar colunas necessárias para integração do WhatsApp com propostas
ALTER TABLE public.whatsapp_instances 
ADD COLUMN IF NOT EXISTS backend_url TEXT DEFAULT 'http://localhost:3001',
ADD COLUMN IF NOT EXISTS backend_token TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_heartbeat TIMESTAMP WITH TIME ZONE;

-- Criar índice para busca rápida de instâncias conectadas
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_status_active 
ON public.whatsapp_instances(status, is_active) 
WHERE status = 'connected' AND is_active = true;