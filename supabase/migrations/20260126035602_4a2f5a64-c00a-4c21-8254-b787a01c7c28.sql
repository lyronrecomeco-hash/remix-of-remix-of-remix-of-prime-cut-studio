-- ================== GENESIS PROPOSALS TABLE ==================
-- Tabela para salvar propostas personalizadas do Wizard

CREATE TABLE IF NOT EXISTS public.genesis_saved_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_niche TEXT,
  main_problem TEXT,
  decision_maker TEXT,
  competitors TEXT,
  failed_attempts TEXT,
  dream_result TEXT,
  contact_phone TEXT,
  ai_questions JSONB DEFAULT '[]'::jsonb,
  generated_proposal TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.genesis_saved_proposals ENABLE ROW LEVEL SECURITY;

-- RLS Policies - STRICT security
DROP POLICY IF EXISTS "Affiliates can view own proposals" ON public.genesis_saved_proposals;
DROP POLICY IF EXISTS "Affiliates can insert own proposals" ON public.genesis_saved_proposals;
DROP POLICY IF EXISTS "Affiliates can update own proposals" ON public.genesis_saved_proposals;
DROP POLICY IF EXISTS "Affiliates can delete own proposals" ON public.genesis_saved_proposals;

CREATE POLICY "Affiliates can view own proposals"
  ON public.genesis_saved_proposals FOR SELECT
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

CREATE POLICY "Affiliates can insert own proposals"
  ON public.genesis_saved_proposals FOR INSERT
  WITH CHECK (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

CREATE POLICY "Affiliates can update own proposals"
  ON public.genesis_saved_proposals FOR UPDATE
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

CREATE POLICY "Affiliates can delete own proposals"
  ON public.genesis_saved_proposals FOR DELETE
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_genesis_saved_proposals_affiliate ON public.genesis_saved_proposals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_genesis_saved_proposals_status ON public.genesis_saved_proposals(status);

-- Trigger for updated_at (may already exist)
DROP TRIGGER IF EXISTS update_genesis_saved_proposals_updated_at ON public.genesis_saved_proposals;
CREATE TRIGGER update_genesis_saved_proposals_updated_at
  BEFORE UPDATE ON public.genesis_saved_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ================== GENESIS USER ONBOARDING TABLE ==================
CREATE TABLE IF NOT EXISTS public.genesis_user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  completed_steps JSONB DEFAULT '[]'::jsonb,
  current_step TEXT DEFAULT 'welcome',
  onboarding_completed BOOLEAN DEFAULT false,
  first_login_at TIMESTAMPTZ,
  last_step_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.genesis_user_onboarding ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own onboarding" ON public.genesis_user_onboarding;
DROP POLICY IF EXISTS "Users can insert own onboarding" ON public.genesis_user_onboarding;
DROP POLICY IF EXISTS "Users can update own onboarding" ON public.genesis_user_onboarding;

CREATE POLICY "Users can view own onboarding"
  ON public.genesis_user_onboarding FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own onboarding"
  ON public.genesis_user_onboarding FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own onboarding"
  ON public.genesis_user_onboarding FOR UPDATE
  USING (user_id = auth.uid());

-- Index
CREATE INDEX IF NOT EXISTS idx_genesis_user_onboarding_user ON public.genesis_user_onboarding(user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_genesis_user_onboarding_updated_at ON public.genesis_user_onboarding;
CREATE TRIGGER update_genesis_user_onboarding_updated_at
  BEFORE UPDATE ON public.genesis_user_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ================== FIX OVERLY PERMISSIVE RLS (safe) ==================

-- Fix admin_settings - ensure user isolation  
DROP POLICY IF EXISTS "Users can manage own settings" ON public.admin_settings;
CREATE POLICY "Users can manage own settings"
  ON public.admin_settings FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());