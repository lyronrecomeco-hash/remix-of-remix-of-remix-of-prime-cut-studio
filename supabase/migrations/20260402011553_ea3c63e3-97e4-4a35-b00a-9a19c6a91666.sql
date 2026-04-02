-- Create login IP tracking table
CREATE TABLE IF NOT EXISTS public.login_ip_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ip_address TEXT NOT NULL,
  login_count INTEGER DEFAULT 1,
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, ip_address)
);

ALTER TABLE public.login_ip_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own IP records"
  ON public.login_ip_tracking
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on login_ip_tracking"
  ON public.login_ip_tracking
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to track IP and auto-block if 2+ different IPs
CREATE OR REPLACE FUNCTION public.track_login_ip(p_user_id UUID, p_ip_address TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_distinct_ips INTEGER;
  v_is_blocked BOOLEAN;
BEGIN
  -- Upsert IP record
  INSERT INTO public.login_ip_tracking (user_id, ip_address, login_count, first_seen_at, last_seen_at)
  VALUES (p_user_id, p_ip_address, 1, now(), now())
  ON CONFLICT (user_id, ip_address)
  DO UPDATE SET login_count = login_ip_tracking.login_count + 1, last_seen_at = now();

  -- Count distinct IPs for this user
  SELECT COUNT(DISTINCT ip_address) INTO v_distinct_ips
  FROM public.login_ip_tracking
  WHERE user_id = p_user_id;

  -- If more than 2 different IPs, block the account
  IF v_distinct_ips > 2 THEN
    UPDATE public.genesis_users
    SET is_blocked = true
    WHERE auth_user_id = p_user_id;

    RETURN json_build_object('blocked', true, 'reason', 'multiple_ips', 'distinct_ips', v_distinct_ips);
  END IF;

  RETURN json_build_object('blocked', false, 'distinct_ips', v_distinct_ips);
END;
$$;