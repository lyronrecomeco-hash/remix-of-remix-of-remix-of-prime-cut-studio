
-- =====================================================
-- SECURITY FIX: Add search_path to functions and fix RLS policies
-- =====================================================

-- 1. Fix functions without search_path (add to those missing)
-- Note: Most functions already have search_path=public set, we'll fix any remaining

-- 2. Fix overly permissive RLS policies

-- Fix affiliate_clicks INSERT policy (currently WITH CHECK true)
DROP POLICY IF EXISTS "Anyone can insert clicks" ON public.affiliate_clicks;
CREATE POLICY "Service role can insert clicks" 
ON public.affiliate_clicks 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Fix affiliate_verification_codes policies
DROP POLICY IF EXISTS "System can select verification codes" ON public.affiliate_verification_codes;
DROP POLICY IF EXISTS "System can update verification codes" ON public.affiliate_verification_codes;

CREATE POLICY "Users can select own verification codes" 
ON public.affiliate_verification_codes 
FOR SELECT 
TO authenticated
USING (email = auth.jwt()->>'email');

CREATE POLICY "Service role can manage verification codes" 
ON public.affiliate_verification_codes 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Create login_attempts blocking function
CREATE OR REPLACE FUNCTION public.check_login_attempts(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempt_count integer;
  last_attempt timestamptz;
  lockout_minutes integer := 15;
  max_attempts integer := 5;
BEGIN
  -- Get recent failed attempts
  SELECT COUNT(*), MAX(created_at) INTO attempt_count, last_attempt
  FROM public.login_attempts
  WHERE email = p_email
    AND success = false
    AND created_at > NOW() - INTERVAL '15 minutes';
  
  -- If too many attempts, check if lockout period passed
  IF attempt_count >= max_attempts THEN
    IF last_attempt > NOW() - (lockout_minutes || ' minutes')::interval THEN
      RETURN false; -- Still locked out
    END IF;
  END IF;
  
  RETURN true; -- Can attempt login
END;
$$;

-- 4. Function to record login attempts
CREATE OR REPLACE FUNCTION public.record_login_attempt(
  p_email text,
  p_success boolean,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.login_attempts (email, success, ip_address, user_agent, created_at)
  VALUES (p_email, p_success, p_ip_address, p_user_agent, NOW());
  
  -- If successful login, clear old failed attempts
  IF p_success THEN
    DELETE FROM public.login_attempts
    WHERE email = p_email
      AND success = false
      AND created_at < NOW() - INTERVAL '1 hour';
  END IF;
END;
$$;

-- 5. Create 2FA secrets table if not exists
CREATE TABLE IF NOT EXISTS public.user_2fa_secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  secret text NOT NULL,
  is_enabled boolean DEFAULT false,
  backup_codes text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_2fa_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own 2FA" 
ON public.user_2fa_secrets 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own 2FA" 
ON public.user_2fa_secrets 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. Create session_tokens table for session management
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token text NOT NULL UNIQUE,
  ip_address text,
  user_agent text,
  last_activity_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" 
ON public.user_sessions 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own sessions" 
ON public.user_sessions 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 7. Function to check session timeout
CREATE OR REPLACE FUNCTION public.check_session_timeout(p_user_id uuid, p_timeout_minutes integer DEFAULT 30)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_activity timestamptz;
BEGIN
  SELECT MAX(last_activity_at) INTO last_activity
  FROM public.user_sessions
  WHERE user_id = p_user_id;
  
  IF last_activity IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN last_activity > NOW() - (p_timeout_minutes || ' minutes')::interval;
END;
$$;

-- 8. Function to update session activity
CREATE OR REPLACE FUNCTION public.update_session_activity(p_session_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_sessions
  SET last_activity_at = NOW()
  WHERE session_token = p_session_token;
END;
$$;

-- 9. Cleanup expired sessions function
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.user_sessions
  WHERE expires_at < NOW();
END;
$$;

-- 10. Fix genesis_check_campaign_dedup function that's missing search_path
CREATE OR REPLACE FUNCTION public.genesis_check_campaign_dedup(p_user uuid, p_phone text, p_message text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  exists_count integer;
BEGIN
  SELECT COUNT(*) INTO exists_count
  FROM public.genesis_campaign_sends
  WHERE user_id = p_user
    AND phone = p_phone
    AND message_hash = md5(p_message)
    AND sent_at > NOW() - INTERVAL '24 hours';
  
  RETURN exists_count > 0;
END;
$$;

-- 11. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.check_login_attempts(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_login_attempt(text, boolean, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_session_timeout(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_session_activity(text) TO authenticated;
