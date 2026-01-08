-- ============================================================
-- GENESIS CAMPAIGNS - ENTERPRISE / PRODUCTION READY
-- ============================================================

-- EXTENSÃO OBRIGATÓRIA
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. CAMPAIGNS
-- ============================================================
CREATE TABLE public.genesis_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.genesis_users(id) ON DELETE CASCADE,
  instance_id UUID NOT NULL REFERENCES public.genesis_instances(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL DEFAULT 'mass_send'
    CHECK (campaign_type IN ('mass_send','reengagement','promotion','reminder','custom')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN (
      'draft','scheduled','running','paused','completed',
      'failed','cancelled','stopped_by_system'
    )),
  -- Mensagem
  message_template TEXT NOT NULL,
  message_variables JSONB DEFAULT '{}',
  media_url TEXT,
  media_type TEXT,
  -- Luna AI
  luna_enabled BOOLEAN DEFAULT false,
  luna_variations_count INTEGER DEFAULT 5,
  luna_similarity_level TEXT DEFAULT 'medium'
    CHECK (luna_similarity_level IN ('low','medium','high')),
  luna_generated_variations JSONB DEFAULT '[]',
  -- Controle humano / anti-ban
  delay_min_seconds INTEGER DEFAULT 10,
  delay_max_seconds INTEGER DEFAULT 30,
  batch_size INTEGER DEFAULT 50,
  pause_after_batch INTEGER DEFAULT 100,
  pause_duration_seconds INTEGER DEFAULT 300,
  send_window_start TIME DEFAULT '08:00',
  send_window_end TIME DEFAULT '22:00',
  send_on_weekends BOOLEAN DEFAULT true,
  -- Estatísticas
  total_contacts INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  replied_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  blocked_count INTEGER DEFAULT 0,
  -- Economia
  credits_estimated INTEGER DEFAULT 0,
  credits_consumed INTEGER DEFAULT 0,
  -- Tempo
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. CONTACT QUEUE (SEM FONTE DE VERDADE DE DEDUP)
-- ============================================================
CREATE TABLE public.genesis_campaign_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.genesis_campaigns(id) ON DELETE CASCADE,
  contact_phone TEXT NOT NULL,
  contact_name TEXT,
  contact_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending'
    CHECK (status IN (
      'pending','queued','sending','sent','delivered',
      'read','replied','failed','blocked','skipped',
      'rate_limited','cooldown'
    )),
  message_sent TEXT,
  variation_index INTEGER,
  attempt_count INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  locked_at TIMESTAMPTZ,
  last_attempt_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. LOGS
-- ============================================================
CREATE TABLE public.genesis_campaign_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.genesis_campaigns(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.genesis_campaign_contacts(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  severity TEXT DEFAULT 'info'
    CHECK (severity IN ('debug','info','warning','error','critical')),
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. AUDIENCES
-- ============================================================
CREATE TABLE public.genesis_campaign_audiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.genesis_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  filters JSONB NOT NULL DEFAULT '{}',
  contact_count INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. GLOBAL DEDUP (FONTE DE VERDADE)
-- ============================================================
CREATE TABLE public.genesis_campaign_dedup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.genesis_users(id) ON DELETE CASCADE,
  phone_hash TEXT NOT NULL,
  message_hash TEXT NOT NULL,
  campaign_id UUID NOT NULL REFERENCES public.genesis_campaigns(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE (user_id, phone_hash, message_hash)
);

-- ============================================================
-- 6. SETTINGS ANTI-BAN
-- ============================================================
CREATE TABLE public.genesis_campaign_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.genesis_users(id) ON DELETE CASCADE,
  max_messages_per_minute INTEGER DEFAULT 10,
  max_messages_per_hour INTEGER DEFAULT 200,
  max_messages_per_day INTEGER DEFAULT 1000,
  auto_pause_on_block BOOLEAN DEFAULT true,
  block_threshold INTEGER DEFAULT 5,
  cooldown_after_block_hours INTEGER DEFAULT 24,
  typing_simulation BOOLEAN DEFAULT true,
  read_receipt_delay BOOLEAN DEFAULT true,
  emergency_stop_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_campaign_user ON public.genesis_campaigns(user_id);
CREATE INDEX idx_campaign_instance ON public.genesis_campaigns(instance_id);
CREATE INDEX idx_campaign_status ON public.genesis_campaigns(status);
CREATE INDEX idx_contacts_campaign ON public.genesis_campaign_contacts(campaign_id);
CREATE INDEX idx_contacts_status ON public.genesis_campaign_contacts(status);
CREATE INDEX idx_contacts_lock ON public.genesis_campaign_contacts(locked_at);
CREATE INDEX idx_dedup_lookup ON public.genesis_campaign_dedup(user_id, phone_hash, message_hash);
CREATE INDEX idx_dedup_expires ON public.genesis_campaign_dedup(expires_at);

-- ============================================================
-- DEDUP FUNCTIONS (CORRIGIDAS)
-- ============================================================
CREATE OR REPLACE FUNCTION public.genesis_check_campaign_dedup(
  p_user UUID,
  p_phone TEXT,
  p_message TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM genesis_campaign_dedup
    WHERE user_id = p_user
      AND phone_hash = encode(digest(p_phone,'sha256'),'hex')
      AND message_hash = encode(digest(p_message,'sha256'),'hex')
      AND expires_at > now()
  ) INTO v_exists;
  RETURN v_exists;
END;
$$;

CREATE OR REPLACE FUNCTION public.genesis_register_campaign_dedup(
  p_user UUID,
  p_phone TEXT,
  p_message TEXT,
  p_campaign UUID,
  p_hours INTEGER DEFAULT 24
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO genesis_campaign_dedup (
    user_id,
    phone_hash,
    message_hash,
    campaign_id,
    expires_at
  ) VALUES (
    p_user,
    encode(digest(p_phone,'sha256'),'hex'),
    encode(digest(p_message,'sha256'),'hex'),
    p_campaign,
    now() + (p_hours || ' hours')::interval
  )
  ON CONFLICT (user_id, phone_hash, message_hash)
  DO UPDATE SET
    sent_at = now(),
    expires_at = EXCLUDED.expires_at;
END;
$$;

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON public.genesis_campaigns
FOR EACH ROW EXECUTE FUNCTION public.update_genesis_economy_updated_at();

CREATE TRIGGER update_campaign_contacts_updated_at
BEFORE UPDATE ON public.genesis_campaign_contacts
FOR EACH ROW EXECUTE FUNCTION public.update_genesis_economy_updated_at();

CREATE TRIGGER update_campaign_audiences_updated_at
BEFORE UPDATE ON public.genesis_campaign_audiences
FOR EACH ROW EXECUTE FUNCTION public.update_genesis_economy_updated_at();

CREATE TRIGGER update_campaign_settings_updated_at
BEFORE UPDATE ON public.genesis_campaign_settings
FOR EACH ROW EXECUTE FUNCTION public.update_genesis_economy_updated_at();

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE public.genesis_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_campaign_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_campaign_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_campaign_audiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_campaign_dedup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_campaign_settings ENABLE ROW LEVEL SECURITY;

-- Campaigns RLS
CREATE POLICY "Users can view own campaigns"
ON public.genesis_campaigns FOR SELECT
USING (user_id IN (SELECT id FROM genesis_users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can create own campaigns"
ON public.genesis_campaigns FOR INSERT
WITH CHECK (user_id IN (SELECT id FROM genesis_users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update own campaigns"
ON public.genesis_campaigns FOR UPDATE
USING (user_id IN (SELECT id FROM genesis_users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can delete own campaigns"
ON public.genesis_campaigns FOR DELETE
USING (user_id IN (SELECT id FROM genesis_users WHERE auth_user_id = auth.uid()));

-- Campaign Contacts RLS
CREATE POLICY "Users can view own campaign contacts"
ON public.genesis_campaign_contacts FOR SELECT
USING (campaign_id IN (
  SELECT id FROM genesis_campaigns WHERE user_id IN (
    SELECT id FROM genesis_users WHERE auth_user_id = auth.uid()
  )
));

CREATE POLICY "Users can manage own campaign contacts"
ON public.genesis_campaign_contacts FOR ALL
USING (campaign_id IN (
  SELECT id FROM genesis_campaigns WHERE user_id IN (
    SELECT id FROM genesis_users WHERE auth_user_id = auth.uid()
  )
));

-- Campaign Logs RLS
CREATE POLICY "Users can view own campaign logs"
ON public.genesis_campaign_logs FOR SELECT
USING (campaign_id IN (
  SELECT id FROM genesis_campaigns WHERE user_id IN (
    SELECT id FROM genesis_users WHERE auth_user_id = auth.uid()
  )
));

CREATE POLICY "Users can create campaign logs"
ON public.genesis_campaign_logs FOR INSERT
WITH CHECK (campaign_id IN (
  SELECT id FROM genesis_campaigns WHERE user_id IN (
    SELECT id FROM genesis_users WHERE auth_user_id = auth.uid()
  )
));

-- Audiences RLS
CREATE POLICY "Users can view own audiences"
ON public.genesis_campaign_audiences FOR SELECT
USING (user_id IN (SELECT id FROM genesis_users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can manage own audiences"
ON public.genesis_campaign_audiences FOR ALL
USING (user_id IN (SELECT id FROM genesis_users WHERE auth_user_id = auth.uid()));

-- Dedup RLS
CREATE POLICY "Users can view own dedup"
ON public.genesis_campaign_dedup FOR SELECT
USING (user_id IN (SELECT id FROM genesis_users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can manage own dedup"
ON public.genesis_campaign_dedup FOR ALL
USING (user_id IN (SELECT id FROM genesis_users WHERE auth_user_id = auth.uid()));

-- Settings RLS
CREATE POLICY "Users can view own settings"
ON public.genesis_campaign_settings FOR SELECT
USING (user_id IN (SELECT id FROM genesis_users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can manage own settings"
ON public.genesis_campaign_settings FOR ALL
USING (user_id IN (SELECT id FROM genesis_users WHERE auth_user_id = auth.uid()));