-- =============================================
-- CAKTO INTEGRATION - ENTERPRISE / PRODUÇÃO EXTREMA
-- =============================================

-- =================================================
-- 1. EVENTOS RECEBIDOS DA CAKTO
-- =================================================
CREATE TABLE IF NOT EXISTS public.genesis_cakto_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES public.genesis_instances(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES public.genesis_instance_integrations(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'initiate_checkout',
      'purchase_approved',
      'purchase_refused',
      'purchase_refunded',
      'checkout_abandonment'
    )
  ),
  external_id TEXT NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  product_id TEXT,
  product_name TEXT,
  offer_id TEXT,
  offer_name TEXT,
  order_value DECIMAL(10,2),
  currency TEXT DEFAULT 'BRL',
  raw_payload JSONB NOT NULL,
  normalized_event JSONB,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  campaign_triggered_id UUID,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(instance_id, external_id, event_type)
);

CREATE INDEX IF NOT EXISTS idx_cakto_events_instance ON public.genesis_cakto_events(instance_id);
CREATE INDEX IF NOT EXISTS idx_cakto_events_type ON public.genesis_cakto_events(event_type);
CREATE INDEX IF NOT EXISTS idx_cakto_events_created ON public.genesis_cakto_events(created_at DESC);

-- =================================================
-- 2. REGRAS EVENTO → CAMPANHA
-- =================================================
CREATE TABLE IF NOT EXISTS public.genesis_cakto_event_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES public.genesis_instances(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES public.genesis_instance_integrations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  campaign_id UUID REFERENCES public.genesis_campaigns(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  delay_seconds INTEGER DEFAULT 0,
  delay_max_seconds INTEGER DEFAULT 0,
  anti_ban_enabled BOOLEAN DEFAULT true,
  cooldown_minutes INTEGER DEFAULT 60,
  max_per_hour INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(instance_id, integration_id, event_type, campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_cakto_rules_instance ON public.genesis_cakto_event_rules(instance_id);

-- =================================================
-- 3. DEDUPLICAÇÃO HARD (CAMADA EXTRA)
-- =================================================
CREATE TABLE IF NOT EXISTS public.genesis_cakto_dedup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL,
  external_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  customer_phone TEXT,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(instance_id, external_id, event_type)
);

-- =================================================
-- 4. CACHE DE PRODUTOS
-- =================================================
CREATE TABLE IF NOT EXISTS public.genesis_cakto_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES public.genesis_instances(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES public.genesis_instance_integrations(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'BRL',
  status TEXT,
  image_url TEXT,
  metadata JSONB DEFAULT '{}',
  synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(instance_id, external_id)
);

-- =================================================
-- 5. CACHE DE OFERTAS
-- =================================================
CREATE TABLE IF NOT EXISTS public.genesis_cakto_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES public.genesis_instances(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES public.genesis_instance_integrations(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  product_external_id TEXT,
  name TEXT NOT NULL,
  price DECIMAL(10,2),
  original_price DECIMAL(10,2),
  currency TEXT DEFAULT 'BRL',
  status TEXT,
  checkout_url TEXT,
  metadata JSONB DEFAULT '{}',
  synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(instance_id, external_id)
);

-- =================================================
-- 6. ANALYTICS AGREGADA (IDEMPOTENTE)
-- =================================================
CREATE TABLE IF NOT EXISTS public.genesis_cakto_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES public.genesis_instances(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES public.genesis_instance_integrations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  checkouts_started INTEGER DEFAULT 0,
  purchases_approved INTEGER DEFAULT 0,
  purchases_refused INTEGER DEFAULT 0,
  purchases_refunded INTEGER DEFAULT 0,
  cart_abandonments INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(instance_id, date)
);

-- =================================================
-- 7. TRIGGER SEGURO (SÓ PROCESSA 1x)
-- =================================================
CREATE OR REPLACE FUNCTION public.update_cakto_analytics_safe()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.processed IS NOT TRUE THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.genesis_cakto_analytics (
    instance_id,
    integration_id,
    date,
    checkouts_started,
    purchases_approved,
    purchases_refused,
    purchases_refunded,
    cart_abandonments,
    total_revenue
  )
  VALUES (
    NEW.instance_id,
    NEW.integration_id,
    CURRENT_DATE,
    CASE WHEN NEW.event_type = 'initiate_checkout' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'purchase_approved' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'purchase_refused' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'purchase_refunded' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'checkout_abandonment' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'purchase_approved' THEN COALESCE(NEW.order_value, 0) ELSE 0 END
  )
  ON CONFLICT (instance_id, date)
  DO UPDATE SET
    checkouts_started = genesis_cakto_analytics.checkouts_started + EXCLUDED.checkouts_started,
    purchases_approved = genesis_cakto_analytics.purchases_approved + EXCLUDED.purchases_approved,
    purchases_refused = genesis_cakto_analytics.purchases_refused + EXCLUDED.purchases_refused,
    purchases_refunded = genesis_cakto_analytics.purchases_refunded + EXCLUDED.purchases_refunded,
    cart_abandonments = genesis_cakto_analytics.cart_abandonments + EXCLUDED.cart_abandonments,
    total_revenue = genesis_cakto_analytics.total_revenue + EXCLUDED.total_revenue,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_cakto_analytics ON public.genesis_cakto_events;

CREATE TRIGGER trigger_update_cakto_analytics
AFTER UPDATE OF processed ON public.genesis_cakto_events
FOR EACH ROW
WHEN (NEW.processed = true)
EXECUTE FUNCTION public.update_cakto_analytics_safe();

-- =================================================
-- 8. RLS (ENTERPRISE)
-- =================================================
ALTER TABLE public.genesis_cakto_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_cakto_event_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_cakto_dedup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_cakto_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_cakto_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_cakto_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access events"
ON public.genesis_cakto_events
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users read own instance data"
ON public.genesis_cakto_events
FOR SELECT
USING (
  instance_id IN (
    SELECT id FROM public.genesis_instances WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Service role full access rules"
ON public.genesis_cakto_event_rules
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users manage own instance rules"
ON public.genesis_cakto_event_rules
FOR ALL
USING (
  instance_id IN (
    SELECT id FROM public.genesis_instances WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Service role full access dedup"
ON public.genesis_cakto_dedup
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access products"
ON public.genesis_cakto_products
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users read own instance products"
ON public.genesis_cakto_products
FOR SELECT
USING (
  instance_id IN (
    SELECT id FROM public.genesis_instances WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Service role full access offers"
ON public.genesis_cakto_offers
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users read own instance offers"
ON public.genesis_cakto_offers
FOR SELECT
USING (
  instance_id IN (
    SELECT id FROM public.genesis_instances WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Service role full access analytics"
ON public.genesis_cakto_analytics
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users read own instance analytics"
ON public.genesis_cakto_analytics
FOR SELECT
USING (
  instance_id IN (
    SELECT id FROM public.genesis_instances WHERE user_id = auth.uid()
  )
);

-- =================================================
-- 9. REALTIME (SOMENTE EVENTOS)
-- =================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.genesis_cakto_events;