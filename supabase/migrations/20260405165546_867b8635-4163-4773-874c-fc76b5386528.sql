
-- Engine WhatsApp Connectors
CREATE TABLE public.engine_whatsapp_connectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Minha Conexão',
  provider TEXT NOT NULL DEFAULT 'chatpro',
  instance_id TEXT,
  token_hash TEXT,
  base_endpoint TEXT DEFAULT 'https://v5.chatpro.com.br',
  webhook_url TEXT,
  status TEXT NOT NULL DEFAULT 'disconnected',
  last_connected_at TIMESTAMPTZ,
  last_error TEXT,
  environment TEXT DEFAULT 'production',
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.engine_whatsapp_connectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own connectors" ON public.engine_whatsapp_connectors
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_engine_whatsapp_connectors_updated_at
  BEFORE UPDATE ON public.engine_whatsapp_connectors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Engine Message Logs
CREATE TABLE public.engine_message_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  connector_id UUID REFERENCES public.engine_whatsapp_connectors(id) ON DELETE SET NULL,
  session_id UUID,
  phone TEXT NOT NULL,
  message_preview TEXT,
  full_message TEXT,
  direction TEXT NOT NULL DEFAULT 'outbound',
  status TEXT NOT NULL DEFAULT 'pending',
  provider_response JSONB,
  ack_status TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.engine_message_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own message logs" ON public.engine_message_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own message logs" ON public.engine_message_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_engine_message_logs_user ON public.engine_message_logs(user_id, created_at DESC);
CREATE INDEX idx_engine_message_logs_connector ON public.engine_message_logs(connector_id);
CREATE INDEX idx_engine_message_logs_status ON public.engine_message_logs(status);

-- Engine Scheduled Messages
CREATE TABLE public.engine_scheduled_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  connector_id UUID REFERENCES public.engine_whatsapp_connectors(id) ON DELETE SET NULL,
  session_id UUID,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  last_error TEXT,
  lead_name TEXT,
  lead_context JSONB DEFAULT '{}',
  message_type TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  executed_at TIMESTAMPTZ
);

ALTER TABLE public.engine_scheduled_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own scheduled messages" ON public.engine_scheduled_messages
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_engine_scheduled_status ON public.engine_scheduled_messages(status, scheduled_at);

CREATE TRIGGER update_engine_scheduled_messages_updated_at
  BEFORE UPDATE ON public.engine_scheduled_messages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
