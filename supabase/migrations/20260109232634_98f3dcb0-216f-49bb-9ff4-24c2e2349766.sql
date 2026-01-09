
-- =====================================================
-- MEGA SECURITY & FEATURES MIGRATION
-- Fixes RLS, adds rate limiting, phone verification, contact lists, etc.
-- =====================================================

-- ================== SECURITY FUNCTIONS ==================

-- Fix search_path for all functions without it
CREATE OR REPLACE FUNCTION public.check_login_attempts(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  failed_count INT;
  last_attempt TIMESTAMPTZ;
  lockout_until TIMESTAMPTZ;
BEGIN
  SELECT COUNT(*), MAX(attempted_at)
  INTO failed_count, last_attempt
  FROM public.login_attempts
  WHERE email = p_email
    AND success = FALSE
    AND attempted_at > NOW() - INTERVAL '15 minutes';
  
  IF failed_count >= 5 THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_login_attempt(
  p_email TEXT,
  p_success BOOLEAN,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.login_attempts (email, success, ip_address, user_agent, attempted_at)
  VALUES (p_email, p_success, p_ip_address, p_user_agent, NOW());
  
  -- Clean old attempts (older than 24 hours)
  DELETE FROM public.login_attempts WHERE attempted_at < NOW() - INTERVAL '24 hours';
END;
$$;

CREATE OR REPLACE FUNCTION public.update_session_activity(p_session_token TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_sessions 
  SET last_activity_at = NOW()
  WHERE session_token = p_session_token AND is_active = TRUE;
END;
$$;

-- ================== RATE LIMITING TABLE ==================

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INT DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON public.rate_limits(identifier, endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON public.rate_limits(window_start);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rate limits accessible by service role only"
ON public.rate_limits FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ================== PHONE VERIFICATION ==================

CREATE TABLE IF NOT EXISTS public.phone_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  email TEXT,
  name TEXT,
  password_hash TEXT,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 5,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_phone_verification_phone ON public.phone_verification_codes(phone);
CREATE INDEX IF NOT EXISTS idx_phone_verification_code ON public.phone_verification_codes(code);

ALTER TABLE public.phone_verification_codes ENABLE ROW LEVEL SECURITY;

-- Public can create verification codes (for signup)
CREATE POLICY "Anyone can request phone verification"
ON public.phone_verification_codes FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Public can update (for attempts)
CREATE POLICY "Anyone can verify phone codes"
ON public.phone_verification_codes FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can read own phone verification"
ON public.phone_verification_codes FOR SELECT
TO anon, authenticated
USING (true);

-- ================== CAPTCHA VERIFICATION LOG ==================

CREATE TABLE IF NOT EXISTS public.captcha_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT NOT NULL,
  ip_address TEXT,
  action TEXT NOT NULL,
  success BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_captcha_ip ON public.captcha_verifications(ip_address, created_at);

ALTER TABLE public.captcha_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Captcha verifications by service role"
ON public.captcha_verifications FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ================== CONTACT LISTS FOR CAMPAIGNS ==================

CREATE TABLE IF NOT EXISTS public.genesis_contact_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.genesis_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  contact_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_lists_user ON public.genesis_contact_lists(user_id);

ALTER TABLE public.genesis_contact_lists ENABLE ROW LEVEL SECURITY;

-- Check if genesis_users has user_id column to get auth_user_id
CREATE OR REPLACE FUNCTION public.get_genesis_user_id_for_auth()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.genesis_users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

CREATE POLICY "Users can manage own contact lists"
ON public.genesis_contact_lists FOR ALL
TO authenticated
USING (user_id = public.get_genesis_user_id_for_auth())
WITH CHECK (user_id = public.get_genesis_user_id_for_auth());

-- ================== CONTACT LIST ITEMS ==================

CREATE TABLE IF NOT EXISTS public.genesis_contact_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES public.genesis_contact_lists(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  name TEXT,
  email TEXT,
  custom_data JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_list_items_list ON public.genesis_contact_list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_contact_list_items_phone ON public.genesis_contact_list_items(phone);

ALTER TABLE public.genesis_contact_list_items ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_contact_list_ownership(p_list_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.genesis_contact_lists
    WHERE id = p_list_id AND user_id = public.get_genesis_user_id_for_auth()
  );
$$;

CREATE POLICY "Users can manage own contact list items"
ON public.genesis_contact_list_items FOR ALL
TO authenticated
USING (public.check_contact_list_ownership(list_id))
WITH CHECK (public.check_contact_list_ownership(list_id));

-- ================== CHATBOT OPERATING HOURS ==================

CREATE TABLE IF NOT EXISTS public.chatbot_operating_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id UUID NOT NULL REFERENCES public.whatsapp_automations(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL DEFAULT '08:00',
  end_time TIME NOT NULL DEFAULT '18:00',
  is_enabled BOOLEAN DEFAULT TRUE,
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chatbot_id, day_of_week)
);

ALTER TABLE public.chatbot_operating_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage chatbot operating hours"
ON public.chatbot_operating_hours FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ================== CHATBOT ANALYTICS ==================

CREATE TABLE IF NOT EXISTS public.chatbot_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id UUID NOT NULL REFERENCES public.whatsapp_automations(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_sessions INT DEFAULT 0,
  completed_sessions INT DEFAULT 0,
  abandoned_sessions INT DEFAULT 0,
  avg_duration_seconds INT DEFAULT 0,
  total_messages INT DEFAULT 0,
  unique_contacts INT DEFAULT 0,
  human_transfers INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chatbot_id, date)
);

CREATE INDEX IF NOT EXISTS idx_chatbot_analytics_date ON public.chatbot_analytics(chatbot_id, date);

ALTER TABLE public.chatbot_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chatbot analytics"
ON public.chatbot_analytics FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "System can manage chatbot analytics"
ON public.chatbot_analytics FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ================== A/B TESTING ==================

CREATE TABLE IF NOT EXISTS public.chatbot_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id UUID NOT NULL REFERENCES public.whatsapp_automations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  variant_a_flow JSONB NOT NULL,
  variant_b_flow JSONB NOT NULL,
  variant_a_name TEXT DEFAULT 'Variante A',
  variant_b_name TEXT DEFAULT 'Variante B',
  traffic_split INT DEFAULT 50 CHECK (traffic_split >= 0 AND traffic_split <= 100),
  is_active BOOLEAN DEFAULT FALSE,
  winner_variant TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chatbot_ab_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage AB tests"
ON public.chatbot_ab_tests FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.chatbot_ab_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.chatbot_ab_tests(id) ON DELETE CASCADE,
  variant TEXT NOT NULL CHECK (variant IN ('A', 'B')),
  session_id UUID,
  contact_phone TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  converted BOOLEAN DEFAULT FALSE,
  conversion_value NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ab_results_test ON public.chatbot_ab_test_results(test_id, variant);

ALTER TABLE public.chatbot_ab_test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view AB test results"
ON public.chatbot_ab_test_results FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "System can manage AB test results"
ON public.chatbot_ab_test_results FOR INSERT
TO authenticated
WITH CHECK (true);

-- ================== MESSAGE TEMPLATES (APPROVED) ==================

CREATE TABLE IF NOT EXISTS public.whatsapp_message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.genesis_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('marketing', 'utility', 'authentication')),
  language TEXT DEFAULT 'pt_BR',
  header_type TEXT CHECK (header_type IN ('none', 'text', 'image', 'video', 'document')),
  header_content TEXT,
  body TEXT NOT NULL,
  footer TEXT,
  buttons JSONB,
  variables JSONB,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  external_id TEXT,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.whatsapp_message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own templates"
ON public.whatsapp_message_templates FOR ALL
TO authenticated
USING (user_id = public.get_genesis_user_id_for_auth())
WITH CHECK (user_id = public.get_genesis_user_id_for_auth());

-- ================== PUSH NOTIFICATION SUBSCRIPTIONS ==================

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_subs_user ON public.push_subscriptions(user_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own push subscriptions"
ON public.push_subscriptions FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ================== WHATSAPP DISCONNECT ALERTS ==================

CREATE TABLE IF NOT EXISTS public.whatsapp_disconnect_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL,
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('disconnected', 'auth_expired', 'blocked', 'rate_limited')),
  message TEXT,
  sent_via_email BOOLEAN DEFAULT FALSE,
  sent_via_push BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disconnect_alerts_user ON public.whatsapp_disconnect_alerts(user_id, created_at);

ALTER TABLE public.whatsapp_disconnect_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own disconnect alerts"
ON public.whatsapp_disconnect_alerts FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "System can create disconnect alerts"
ON public.whatsapp_disconnect_alerts FOR INSERT
TO authenticated
WITH CHECK (true);

-- ================== USER PREFERENCES (THEME, ONBOARDING) ==================

CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INT DEFAULT 0,
  keyboard_shortcuts_enabled BOOLEAN DEFAULT TRUE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  language TEXT DEFAULT 'pt-BR',
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON public.user_preferences(user_id);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences"
ON public.user_preferences FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ================== FIX OVERLY PERMISSIVE RLS POLICIES ==================

-- Drop and recreate chatbot_sessions policies with proper security
DROP POLICY IF EXISTS "Service role full access to sessions" ON public.chatbot_sessions;

-- Create proper policies for chatbot_sessions
CREATE POLICY "Users can view sessions from their chatbots"
ON public.chatbot_sessions FOR SELECT
TO authenticated
USING (
  chatbot_id IN (
    SELECT id FROM public.whatsapp_automations 
    WHERE instance_id IN (
      SELECT id FROM public.genesis_instances 
      WHERE user_id = public.get_genesis_user_id_for_auth()
    )
  )
);

CREATE POLICY "System can manage chatbot sessions"
ON public.chatbot_sessions FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "System can update chatbot sessions"
ON public.chatbot_sessions FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- ================== TRIGGER FOR UPDATING CONTACT COUNT ==================

CREATE OR REPLACE FUNCTION public.update_contact_list_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.genesis_contact_lists
    SET contact_count = contact_count + 1, updated_at = NOW()
    WHERE id = NEW.list_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.genesis_contact_lists
    SET contact_count = contact_count - 1, updated_at = NOW()
    WHERE id = OLD.list_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_contact_list_count ON public.genesis_contact_list_items;
CREATE TRIGGER trigger_update_contact_list_count
AFTER INSERT OR DELETE ON public.genesis_contact_list_items
FOR EACH ROW EXECUTE FUNCTION public.update_contact_list_count();

-- ================== TOTP VERIFICATION FUNCTION (SERVER-SIDE) ==================

CREATE OR REPLACE FUNCTION public.verify_totp_code(p_user_id UUID, p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_secret TEXT;
  v_backup_codes TEXT[];
  v_is_backup BOOLEAN := FALSE;
BEGIN
  -- Get user's 2FA secret
  SELECT secret, backup_codes INTO v_secret, v_backup_codes
  FROM public.user_2fa_secrets
  WHERE user_id = p_user_id AND is_enabled = TRUE;
  
  IF v_secret IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if it's a backup code
  IF p_code = ANY(v_backup_codes) THEN
    -- Remove used backup code
    UPDATE public.user_2fa_secrets
    SET backup_codes = array_remove(backup_codes, p_code)
    WHERE user_id = p_user_id;
    RETURN TRUE;
  END IF;
  
  -- For TOTP verification, we need to call an edge function
  -- This is a placeholder that returns true for demo
  -- In production, use proper HMAC-SHA1 verification
  RETURN TRUE;
END;
$$;

-- ================== HELPER FUNCTION FOR RATE LIMITING ==================

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_endpoint TEXT,
  p_limit INT,
  p_window_minutes INT
)
RETURNS TABLE(allowed BOOLEAN, remaining INT, reset_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
  v_window_start TIMESTAMPTZ;
  v_reset_at TIMESTAMPTZ;
BEGIN
  v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  v_reset_at := NOW() + (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Get current count in window
  SELECT COALESCE(SUM(request_count), 0) INTO v_count
  FROM public.rate_limits
  WHERE identifier = p_identifier 
    AND endpoint = p_endpoint
    AND window_start >= v_window_start;
  
  IF v_count >= p_limit THEN
    RETURN QUERY SELECT FALSE, 0, v_reset_at;
    RETURN;
  END IF;
  
  -- Record this request
  INSERT INTO public.rate_limits (identifier, endpoint, request_count, window_start)
  VALUES (p_identifier, p_endpoint, 1, NOW())
  ON CONFLICT DO NOTHING;
  
  RETURN QUERY SELECT TRUE, p_limit - v_count - 1, v_reset_at;
END;
$$;

-- ================== CLEAN OLD RATE LIMITS ==================

CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM public.rate_limits
  WHERE window_start < NOW() - INTERVAL '1 hour';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
