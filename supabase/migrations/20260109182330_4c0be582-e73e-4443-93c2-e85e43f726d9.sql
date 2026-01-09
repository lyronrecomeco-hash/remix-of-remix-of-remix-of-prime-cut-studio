-- ============================================================
-- GENESIS ANTI-BAN + WARMUP + INSTANCE POOL
-- EXTREME PRODUCTION / ENTERPRISE HARDENED
-- ============================================================

-- ============================================================
-- 1. POOL DE INSTÂNCIAS PARA CAMPANHAS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.genesis_campaign_instance_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.genesis_campaigns(id) ON DELETE CASCADE,
  instance_id UUID NOT NULL REFERENCES public.genesis_instances(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 1,
  weight INTEGER DEFAULT 100 CHECK (weight > 0),
  is_active BOOLEAN DEFAULT true,
  messages_sent INTEGER DEFAULT 0,
  messages_failed INTEGER DEFAULT 0,
  blocks_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  cooldown_until TIMESTAMPTZ,
  health_score INTEGER DEFAULT 100 CHECK (health_score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(campaign_id, instance_id)
);

CREATE INDEX IF NOT EXISTS idx_pool_campaign_active
ON public.genesis_campaign_instance_pool(campaign_id, is_active);

-- ============================================================
-- 2. BLACKLIST GLOBAL DE CONTATOS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.genesis_contact_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.genesis_users(id) ON DELETE CASCADE,
  phone_hash TEXT NOT NULL,
  phone_last4 TEXT,
  reason TEXT NOT NULL CHECK (reason IN ('blocked','unsubscribed','spam_reported','manual','quarantine')),
  source_campaign_id UUID REFERENCES public.genesis_campaigns(id) ON DELETE SET NULL,
  quarantine_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, phone_hash)
);

CREATE INDEX IF NOT EXISTS idx_blacklist_lookup
ON public.genesis_contact_blacklist(user_id, phone_hash);

-- ============================================================
-- 3. MÉTRICAS DE SAÚDE DA INSTÂNCIA
-- ============================================================
CREATE TABLE IF NOT EXISTS public.genesis_instance_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES public.genesis_instances(id) ON DELETE CASCADE,
  period_date DATE NOT NULL DEFAULT CURRENT_DATE,
  messages_sent INTEGER DEFAULT 0,
  messages_delivered INTEGER DEFAULT 0,
  messages_read INTEGER DEFAULT 0,
  messages_replied INTEGER DEFAULT 0,
  messages_failed INTEGER DEFAULT 0,
  messages_blocked INTEGER DEFAULT 0,
  health_score INTEGER DEFAULT 100,
  degradation_level INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(instance_id, period_date)
);

CREATE INDEX IF NOT EXISTS idx_health_instance_date
ON public.genesis_instance_health_metrics(instance_id, period_date DESC);

-- ============================================================
-- 4. WARM-UP DE INSTÂNCIA
-- ============================================================
CREATE TABLE IF NOT EXISTS public.genesis_instance_warmup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES public.genesis_instances(id) ON DELETE CASCADE UNIQUE,
  warmup_started_at TIMESTAMPTZ DEFAULT now(),
  warmup_day INTEGER DEFAULT 1 CHECK (warmup_day BETWEEN 1 AND 10),
  warmup_completed BOOLEAN DEFAULT false,
  warmup_completed_at TIMESTAMPTZ,
  day1_limit INTEGER DEFAULT 10,
  day2_limit INTEGER DEFAULT 25,
  day3_limit INTEGER DEFAULT 50,
  day4_limit INTEGER DEFAULT 100,
  day5_limit INTEGER DEFAULT 150,
  day6_limit INTEGER DEFAULT 200,
  day7_limit INTEGER DEFAULT 300,
  day8_limit INTEGER DEFAULT 400,
  day9_limit INTEGER DEFAULT 500,
  day10_limit INTEGER DEFAULT 999999,
  messages_sent_today INTEGER DEFAULT 0,
  last_message_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. SPAM WORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.genesis_spam_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL UNIQUE,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_spam_words_active
ON public.genesis_spam_words(word)
WHERE is_active = true;

-- ============================================================
-- 6. CAMPANHAS – CAMPOS ANTI-BAN
-- ============================================================
ALTER TABLE public.genesis_campaigns
  ADD COLUMN IF NOT EXISTS use_instance_pool BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS typing_simulation BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS typing_duration_min INTEGER DEFAULT 2,
  ADD COLUMN IF NOT EXISTS typing_duration_max INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS adaptive_delay BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS respect_warmup BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS check_blacklist BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS quarantine_days INTEGER DEFAULT 7,
  ADD COLUMN IF NOT EXISTS prioritize_warm_leads BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS peak_hours_boost BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS spam_word_check BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS cooldown_after_block_minutes INTEGER DEFAULT 60,
  ADD COLUMN IF NOT EXISTS max_blocks_before_pause INTEGER DEFAULT 3;

-- ============================================================
-- 7. CONTATOS – CAMPANHA
-- ============================================================
ALTER TABLE public.genesis_campaign_contacts
  ADD COLUMN IF NOT EXISTS is_warm_lead BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS previous_interaction_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS spam_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS instance_used_id UUID REFERENCES public.genesis_instances(id);

-- ============================================================
-- 8. SETTINGS GLOBAIS
-- ============================================================
ALTER TABLE public.genesis_campaign_settings
  ADD COLUMN IF NOT EXISTS global_blacklist_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS default_quarantine_days INTEGER DEFAULT 7,
  ADD COLUMN IF NOT EXISTS warmup_required_for_new BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS peak_hours_start TIME DEFAULT '10:00',
  ADD COLUMN IF NOT EXISTS peak_hours_end TIME DEFAULT '12:00',
  ADD COLUMN IF NOT EXISTS peak_hours_afternoon_start TIME DEFAULT '14:00',
  ADD COLUMN IF NOT EXISTS peak_hours_afternoon_end TIME DEFAULT '18:00',
  ADD COLUMN IF NOT EXISTS max_daily_per_instance INTEGER DEFAULT 500,
  ADD COLUMN IF NOT EXISTS spam_word_block_level TEXT DEFAULT 'high';

-- ============================================================
-- 9. FUNÇÕES ENTERPRISE
-- ============================================================
-- Warm-up limit
CREATE OR REPLACE FUNCTION public.get_warmup_limit(p_instance_id UUID)
RETURNS INTEGER AS $$
DECLARE r RECORD;
BEGIN
  SELECT * INTO r FROM public.genesis_instance_warmup WHERE instance_id = p_instance_id;
  IF NOT FOUND OR r.warmup_completed THEN RETURN 999999; END IF;
  RETURN GREATEST(0,
    CASE r.warmup_day
      WHEN 1 THEN r.day1_limit
      WHEN 2 THEN r.day2_limit
      WHEN 3 THEN r.day3_limit
      WHEN 4 THEN r.day4_limit
      WHEN 5 THEN r.day5_limit
      WHEN 6 THEN r.day6_limit
      WHEN 7 THEN r.day7_limit
      WHEN 8 THEN r.day8_limit
      WHEN 9 THEN r.day9_limit
      ELSE r.day10_limit
    END - COALESCE(r.messages_sent_today,0)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Select instance from pool
CREATE OR REPLACE FUNCTION public.select_pool_instance(p_campaign_id UUID)
RETURNS UUID AS $$
DECLARE v_instance UUID;
BEGIN
  SELECT instance_id INTO v_instance
  FROM public.genesis_campaign_instance_pool
  WHERE campaign_id = p_campaign_id
    AND is_active = true
    AND (cooldown_until IS NULL OR cooldown_until < now())
  ORDER BY
    health_score DESC,
    blocks_count ASC,
    (random() * weight) DESC,
    last_used_at NULLS FIRST
  LIMIT 1;
  RETURN v_instance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Check blacklist
CREATE OR REPLACE FUNCTION public.check_contact_blacklisted(
  p_user_id UUID,
  p_phone TEXT
) RETURNS BOOLEAN AS $$
DECLARE normalized TEXT; hashed TEXT;
BEGIN
  normalized := regexp_replace(p_phone, '\D', '', 'g');
  hashed := encode(digest(normalized, 'sha256'), 'hex');
  RETURN EXISTS (
    SELECT 1 FROM public.genesis_contact_blacklist
    WHERE user_id = p_user_id
      AND phone_hash = hashed
      AND (quarantine_until IS NULL OR quarantine_until > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update instance health
CREATE OR REPLACE FUNCTION public.update_instance_health(p_instance_id UUID)
RETURNS void AS $$
DECLARE sent INT; blocked INT; replied INT; health INT; degradation INT;
BEGIN
  SELECT SUM(messages_sent), SUM(messages_blocked), SUM(messages_replied)
  INTO sent, blocked, replied
  FROM public.genesis_instance_health_metrics
  WHERE instance_id = p_instance_id
    AND period_date >= CURRENT_DATE - 6;

  IF COALESCE(sent,0) = 0 THEN RETURN; END IF;

  health := 100
    - LEAST(50, (blocked::FLOAT / sent * 50)::INT)
    + LEAST(30, (replied::FLOAT / sent * 30)::INT);
  health := GREATEST(0, LEAST(100, health));

  degradation := CASE
    WHEN health >= 80 THEN 0
    WHEN health >= 60 THEN 1
    WHEN health >= 40 THEN 2
    ELSE 3
  END;

  INSERT INTO public.genesis_instance_health_metrics(instance_id, period_date, health_score, degradation_level)
  VALUES (p_instance_id, CURRENT_DATE, health, degradation)
  ON CONFLICT (instance_id, period_date)
  DO UPDATE SET health_score = EXCLUDED.health_score,
                degradation_level = EXCLUDED.degradation_level,
                updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================
-- 10. RLS
-- ============================================================
ALTER TABLE public.genesis_campaign_instance_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_contact_blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_instance_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_instance_warmup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_spam_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage pool via campaign"
ON public.genesis_campaign_instance_pool
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.genesis_campaigns c
    WHERE c.id = campaign_id
      AND c.user_id = public.get_genesis_user_id(auth.uid())
  )
);

CREATE POLICY "Users manage blacklist"
ON public.genesis_contact_blacklist
FOR ALL USING (user_id = public.get_genesis_user_id(auth.uid()));

CREATE POLICY "Users view health"
ON public.genesis_instance_health_metrics
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.genesis_instances i
    WHERE i.id = instance_id
      AND i.user_id = public.get_genesis_user_id(auth.uid())
  )
);

CREATE POLICY "Users manage warmup"
ON public.genesis_instance_warmup
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.genesis_instances i
    WHERE i.id = instance_id
      AND i.user_id = public.get_genesis_user_id(auth.uid())
  )
);

CREATE POLICY "Read spam words"
ON public.genesis_spam_words
FOR SELECT USING (true);