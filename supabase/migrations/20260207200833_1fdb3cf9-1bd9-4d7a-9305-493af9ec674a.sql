
-- Add conversation state column to telbot_users
ALTER TABLE public.telbot_users 
ADD COLUMN IF NOT EXISTS conversation_state jsonb DEFAULT null;

-- Add index for quick state lookup
CREATE INDEX IF NOT EXISTS idx_telbot_users_telegram_id ON public.telbot_users(telegram_id);
