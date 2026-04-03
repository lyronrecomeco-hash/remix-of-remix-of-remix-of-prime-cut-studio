
-- Hot Offers table
CREATE TABLE public.hot_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  niche TEXT NOT NULL,
  headline TEXT NOT NULL,
  copy TEXT,
  cta_text TEXT,
  platform TEXT NOT NULL DEFAULT 'meta',
  format TEXT DEFAULT 'image',
  heat_score INTEGER NOT NULL DEFAULT 0,
  days_active INTEGER DEFAULT 0,
  advertiser_name TEXT,
  creative_url TEXT,
  landing_url TEXT,
  hook TEXT,
  promise TEXT,
  mental_trigger TEXT,
  angle TEXT,
  ideal_niches TEXT[],
  suggested_ticket NUMERIC(10,2),
  closing_chance INTEGER DEFAULT 0,
  ai_blueprint JSONB,
  engagement_score INTEGER DEFAULT 0,
  recurrence_count INTEGER DEFAULT 1,
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  country TEXT DEFAULT 'BR',
  language TEXT DEFAULT 'pt',
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hot_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view hot offers"
ON public.hot_offers FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Only service role can insert/update hot offers"
ON public.hot_offers FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "Only super_admin can update hot offers"
ON public.hot_offers FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
);

CREATE INDEX idx_hot_offers_niche ON public.hot_offers(niche);
CREATE INDEX idx_hot_offers_heat_score ON public.hot_offers(heat_score DESC);
CREATE INDEX idx_hot_offers_platform ON public.hot_offers(platform);

-- User saved offers
CREATE TABLE public.hot_offer_saves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  offer_id UUID NOT NULL REFERENCES public.hot_offers(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, offer_id)
);

ALTER TABLE public.hot_offer_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saves"
ON public.hot_offer_saves FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can save offers"
ON public.hot_offer_saves FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave offers"
ON public.hot_offer_saves FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Search history
CREATE TABLE public.hot_offer_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  query TEXT NOT NULL,
  niche TEXT,
  filters JSONB,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hot_offer_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own searches"
ON public.hot_offer_searches FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own searches"
ON public.hot_offer_searches FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Updated at trigger
CREATE TRIGGER update_hot_offers_updated_at
BEFORE UPDATE ON public.hot_offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
