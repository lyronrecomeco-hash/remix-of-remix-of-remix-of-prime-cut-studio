-- =====================================================
-- GENESIS WEBHOOK UNIVERSAL INFRASTRUCTURE
-- =====================================================

-- Genesis Webhook Configurations (Universal Gateway)
CREATE TABLE IF NOT EXISTS public.genesis_webhook_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.genesis_users(id) ON DELETE CASCADE,
  flow_id UUID REFERENCES public.whatsapp_automation_rules(id) ON DELETE SET NULL,
  
  -- Webhook Identity
  webhook_id TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  name TEXT NOT NULL,
  description TEXT,
  
  -- Security Configuration
  secret_key TEXT,
  auth_type TEXT DEFAULT 'none' CHECK (auth_type IN ('none', 'token', 'header', 'hmac', 'ip_whitelist', 'basic')),
  auth_config JSONB DEFAULT '{}',
  
  -- Rate Limiting
  rate_limit_per_minute INTEGER DEFAULT 60,
  rate_limit_per_hour INTEGER DEFAULT 1000,
  burst_limit INTEGER DEFAULT 10,
  
  -- Deduplication
  dedup_enabled BOOLEAN DEFAULT true,
  dedup_window_seconds INTEGER DEFAULT 300,
  dedup_field TEXT DEFAULT 'event_id',
  
  -- Response Configuration
  custom_response_enabled BOOLEAN DEFAULT false,
  custom_response JSONB DEFAULT '{"status": 200, "body": {"success": true}}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_triggered_at TIMESTAMPTZ
);

-- Genesis Webhook Events (Received Events)
CREATE TABLE IF NOT EXISTS public.genesis_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_config_id UUID NOT NULL REFERENCES public.genesis_webhook_configs(id) ON DELETE CASCADE,
  
  -- Event Identity
  event_id TEXT,
  execution_id UUID,
  
  -- Request Data
  method TEXT NOT NULL,
  path TEXT,
  headers JSONB DEFAULT '{}',
  query_params JSONB DEFAULT '{}',
  body_raw TEXT,
  body_parsed JSONB,
  content_type TEXT,
  
  -- Source Info
  source_ip TEXT,
  user_agent TEXT,
  
  -- Processing Status
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'validated', 'queued', 'processing', 'completed', 'failed', 'duplicate', 'rejected')),
  validation_result JSONB,
  
  -- Error Tracking
  error_message TEXT,
  error_details JSONB,
  
  -- Timestamps
  received_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Genesis Webhook Dead Letters
CREATE TABLE IF NOT EXISTS public.genesis_webhook_dead_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_event_id UUID NOT NULL REFERENCES public.genesis_webhook_events(id) ON DELETE CASCADE,
  webhook_config_id UUID NOT NULL REFERENCES public.genesis_webhook_configs(id) ON DELETE CASCADE,
  
  -- Original Event Data
  original_payload JSONB NOT NULL,
  original_headers JSONB,
  
  -- Failure Info
  failure_reason TEXT NOT NULL,
  failure_details JSONB,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'retrying', 'reprocessed', 'abandoned')),
  
  -- Timestamps
  failed_at TIMESTAMPTZ DEFAULT now(),
  last_retry_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);

-- Genesis Webhook Rate Limits
CREATE TABLE IF NOT EXISTS public.genesis_webhook_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_config_id UUID NOT NULL REFERENCES public.genesis_webhook_configs(id) ON DELETE CASCADE,
  source_ip TEXT,
  
  -- Counters
  requests_minute INTEGER DEFAULT 0,
  requests_hour INTEGER DEFAULT 0,
  burst_count INTEGER DEFAULT 0,
  
  -- Windows
  minute_window_start TIMESTAMPTZ DEFAULT now(),
  hour_window_start TIMESTAMPTZ DEFAULT now(),
  burst_window_start TIMESTAMPTZ DEFAULT now(),
  
  -- Blocking
  is_blocked BOOLEAN DEFAULT false,
  blocked_until TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_genesis_webhook_configs_user_id ON public.genesis_webhook_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_genesis_webhook_configs_webhook_id ON public.genesis_webhook_configs(webhook_id);
CREATE INDEX IF NOT EXISTS idx_genesis_webhook_configs_flow_id ON public.genesis_webhook_configs(flow_id);
CREATE INDEX IF NOT EXISTS idx_genesis_webhook_events_config_id ON public.genesis_webhook_events(webhook_config_id);
CREATE INDEX IF NOT EXISTS idx_genesis_webhook_events_event_id ON public.genesis_webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_genesis_webhook_events_status ON public.genesis_webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_genesis_webhook_events_received_at ON public.genesis_webhook_events(received_at);
CREATE INDEX IF NOT EXISTS idx_genesis_webhook_dead_letters_status ON public.genesis_webhook_dead_letters(status);
CREATE INDEX IF NOT EXISTS idx_genesis_webhook_rate_limits_ip ON public.genesis_webhook_rate_limits(webhook_config_id, source_ip);

-- Enable RLS
ALTER TABLE public.genesis_webhook_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_webhook_dead_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_webhook_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for genesis_webhook_configs
CREATE POLICY "Users can manage own webhook configs"
  ON public.genesis_webhook_configs FOR ALL
  USING (user_id = public.get_genesis_user_id(auth.uid()));

-- RLS Policies for genesis_webhook_events
CREATE POLICY "Users can view own webhook events"
  ON public.genesis_webhook_events FOR SELECT
  USING (webhook_config_id IN (SELECT id FROM public.genesis_webhook_configs WHERE user_id = public.get_genesis_user_id(auth.uid())));

CREATE POLICY "Service role can insert webhook events"
  ON public.genesis_webhook_events FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update webhook events"
  ON public.genesis_webhook_events FOR UPDATE USING (true);

-- RLS Policies for genesis_webhook_dead_letters
CREATE POLICY "Users can manage own dead letters"
  ON public.genesis_webhook_dead_letters FOR ALL
  USING (webhook_config_id IN (SELECT id FROM public.genesis_webhook_configs WHERE user_id = public.get_genesis_user_id(auth.uid())));

-- RLS Policies for genesis_webhook_rate_limits
CREATE POLICY "Service role can manage rate limits"
  ON public.genesis_webhook_rate_limits FOR ALL USING (true);

-- Super admin policies
CREATE POLICY "Super admins manage all webhook configs"
  ON public.genesis_webhook_configs FOR ALL USING (public.is_genesis_super_admin(auth.uid()));

CREATE POLICY "Super admins manage all webhook events"
  ON public.genesis_webhook_events FOR ALL USING (public.is_genesis_super_admin(auth.uid()));

CREATE POLICY "Super admins manage all dead letters"
  ON public.genesis_webhook_dead_letters FOR ALL USING (public.is_genesis_super_admin(auth.uid()));

-- Function to check webhook rate limits
CREATE OR REPLACE FUNCTION public.genesis_check_webhook_rate_limit(
  p_webhook_config_id UUID,
  p_source_ip TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_config RECORD;
  v_rate_limit RECORD;
  v_now TIMESTAMPTZ := now();
  v_allowed BOOLEAN := true;
  v_reason TEXT := null;
BEGIN
  SELECT * INTO v_config FROM genesis_webhook_configs WHERE id = p_webhook_config_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'webhook_not_found');
  END IF;
  
  SELECT * INTO v_rate_limit FROM genesis_webhook_rate_limits 
  WHERE webhook_config_id = p_webhook_config_id AND (source_ip = p_source_ip OR source_ip IS NULL)
  ORDER BY source_ip DESC NULLS LAST LIMIT 1;
  
  IF NOT FOUND THEN
    INSERT INTO genesis_webhook_rate_limits (webhook_config_id, source_ip)
    VALUES (p_webhook_config_id, p_source_ip) RETURNING * INTO v_rate_limit;
  END IF;
  
  IF v_rate_limit.is_blocked AND v_rate_limit.blocked_until > v_now THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'blocked', 'blocked_until', v_rate_limit.blocked_until);
  END IF;
  
  IF v_rate_limit.minute_window_start + interval '1 minute' < v_now THEN
    UPDATE genesis_webhook_rate_limits SET requests_minute = 0, minute_window_start = v_now WHERE id = v_rate_limit.id;
    v_rate_limit.requests_minute := 0;
  END IF;
  
  IF v_rate_limit.hour_window_start + interval '1 hour' < v_now THEN
    UPDATE genesis_webhook_rate_limits SET requests_hour = 0, hour_window_start = v_now WHERE id = v_rate_limit.id;
    v_rate_limit.requests_hour := 0;
  END IF;
  
  IF v_rate_limit.requests_minute >= v_config.rate_limit_per_minute THEN
    v_allowed := false; v_reason := 'rate_limit_minute';
  ELSIF v_rate_limit.requests_hour >= v_config.rate_limit_per_hour THEN
    v_allowed := false; v_reason := 'rate_limit_hour';
  END IF;
  
  IF v_allowed THEN
    UPDATE genesis_webhook_rate_limits SET requests_minute = requests_minute + 1, requests_hour = requests_hour + 1, updated_at = v_now WHERE id = v_rate_limit.id;
  END IF;
  
  RETURN jsonb_build_object('allowed', v_allowed, 'reason', v_reason, 'requests_minute', v_rate_limit.requests_minute + 1, 'requests_hour', v_rate_limit.requests_hour + 1);
END;
$$;

-- Function to check deduplication
CREATE OR REPLACE FUNCTION public.genesis_check_webhook_dedup(
  p_webhook_config_id UUID,
  p_event_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_config RECORD;
  v_exists BOOLEAN;
BEGIN
  SELECT * INTO v_config FROM genesis_webhook_configs WHERE id = p_webhook_config_id;
  IF NOT FOUND OR NOT v_config.dedup_enabled THEN RETURN true; END IF;
  
  SELECT EXISTS(
    SELECT 1 FROM genesis_webhook_events
    WHERE webhook_config_id = p_webhook_config_id AND event_id = p_event_id
      AND received_at > now() - (v_config.dedup_window_seconds || ' seconds')::interval
  ) INTO v_exists;
  
  RETURN NOT v_exists;
END;
$$;