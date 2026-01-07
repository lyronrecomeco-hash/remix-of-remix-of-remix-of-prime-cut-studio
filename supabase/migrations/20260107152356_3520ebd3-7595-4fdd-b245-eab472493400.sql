-- Dedupe table to prevent processing the same inbound WhatsApp message more than once
CREATE TABLE IF NOT EXISTS public.chatbot_inbound_dedup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id uuid NOT NULL,
  message_id text NOT NULL,
  from_jid text NULL,
  chatbot_id uuid NULL,
  session_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chatbot_inbound_dedup_instance_message_unique UNIQUE (instance_id, message_id)
);

ALTER TABLE public.chatbot_inbound_dedup ENABLE ROW LEVEL SECURITY;

-- Indexes for housekeeping / querying
CREATE INDEX IF NOT EXISTS chatbot_inbound_dedup_created_at_idx
  ON public.chatbot_inbound_dedup (created_at DESC);
CREATE INDEX IF NOT EXISTS chatbot_inbound_dedup_instance_idx
  ON public.chatbot_inbound_dedup (instance_id);
