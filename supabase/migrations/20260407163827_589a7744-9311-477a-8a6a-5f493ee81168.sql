
-- Support chat sessions
CREATE TABLE public.support_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_name TEXT,
  user_email TEXT,
  first_message TEXT,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'closed')),
  admin_telegram_chat_id BIGINT,
  admin_telegram_message_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.support_chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions" ON public.support_chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create sessions" ON public.support_chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access sessions" ON public.support_chat_sessions
  FOR ALL USING (true) WITH CHECK (true);

-- Support chat messages
CREATE TABLE public.support_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.support_chat_sessions(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin', 'system')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.support_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from their sessions" ON public.support_chat_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.support_chat_sessions WHERE id = session_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can insert messages in their sessions" ON public.support_chat_messages
  FOR INSERT WITH CHECK (
    sender_type = 'user' AND
    EXISTS (SELECT 1 FROM public.support_chat_sessions WHERE id = session_id AND user_id = auth.uid())
  );

CREATE POLICY "Service role full access messages" ON public.support_chat_messages
  FOR ALL USING (true) WITH CHECK (true);

-- Prompt learning history
CREATE TABLE public.prompt_learning_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  niche TEXT,
  platform TEXT,
  language TEXT,
  prompt_hash TEXT,
  prompt_length INTEGER,
  sections_used TEXT[],
  feedback_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.prompt_learning_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own prompts" ON public.prompt_learning_history
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Enable realtime for support chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_chat_messages;

-- Indexes
CREATE INDEX idx_support_sessions_user ON public.support_chat_sessions(user_id);
CREATE INDEX idx_support_sessions_status ON public.support_chat_sessions(status);
CREATE INDEX idx_support_messages_session ON public.support_chat_messages(session_id);
CREATE INDEX idx_prompt_learning_niche ON public.prompt_learning_history(niche, platform);
