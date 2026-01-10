-- Criar função para atualizar genesis_cakto_analytics quando evento é inserido
CREATE OR REPLACE FUNCTION public.update_cakto_analytics_on_event()
RETURNS TRIGGER AS $$
DECLARE
  event_date DATE;
  integration_uuid UUID;
BEGIN
  event_date := DATE(NEW.created_at);
  integration_uuid := NEW.integration_id;
  
  -- Se integration_id for null, tentar buscar da tabela de integrações
  IF integration_uuid IS NULL THEN
    SELECT id INTO integration_uuid
    FROM genesis_instance_integrations
    WHERE instance_id = NEW.instance_id
      AND provider = 'cakto'
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;

  -- Só inserir se tiver integration_id
  IF integration_uuid IS NULL THEN
    RETURN NEW;
  END IF;

  -- Upsert no registro de analytics do dia
  INSERT INTO genesis_cakto_analytics (
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
    integration_uuid,
    event_date,
    CASE WHEN NEW.event_type = 'initiate_checkout' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'purchase_approved' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'purchase_refused' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'purchase_refunded' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'checkout_abandonment' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'purchase_approved' THEN COALESCE(NEW.order_value, 0) ELSE 0 END
  )
  ON CONFLICT (instance_id, date) 
  DO UPDATE SET
    checkouts_started = genesis_cakto_analytics.checkouts_started + 
      CASE WHEN NEW.event_type = 'initiate_checkout' THEN 1 ELSE 0 END,
    purchases_approved = genesis_cakto_analytics.purchases_approved + 
      CASE WHEN NEW.event_type = 'purchase_approved' THEN 1 ELSE 0 END,
    purchases_refused = genesis_cakto_analytics.purchases_refused + 
      CASE WHEN NEW.event_type = 'purchase_refused' THEN 1 ELSE 0 END,
    purchases_refunded = genesis_cakto_analytics.purchases_refunded + 
      CASE WHEN NEW.event_type = 'purchase_refunded' THEN 1 ELSE 0 END,
    cart_abandonments = genesis_cakto_analytics.cart_abandonments + 
      CASE WHEN NEW.event_type = 'checkout_abandonment' THEN 1 ELSE 0 END,
    total_revenue = genesis_cakto_analytics.total_revenue + 
      CASE WHEN NEW.event_type = 'purchase_approved' THEN COALESCE(NEW.order_value, 0) ELSE 0 END,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger para chamar a função quando evento é inserido
DROP TRIGGER IF EXISTS trigger_update_cakto_analytics ON genesis_cakto_events;

CREATE TRIGGER trigger_update_cakto_analytics
  AFTER INSERT ON genesis_cakto_events
  FOR EACH ROW
  EXECUTE FUNCTION update_cakto_analytics_on_event();

-- Popular analytics com eventos existentes (usando a integração correta)
INSERT INTO genesis_cakto_analytics (
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
SELECT 
  e.instance_id,
  i.id as integration_id,
  DATE(e.created_at) as date,
  COUNT(*) FILTER (WHERE e.event_type = 'initiate_checkout'),
  COUNT(*) FILTER (WHERE e.event_type = 'purchase_approved'),
  COUNT(*) FILTER (WHERE e.event_type = 'purchase_refused'),
  COUNT(*) FILTER (WHERE e.event_type = 'purchase_refunded'),
  COUNT(*) FILTER (WHERE e.event_type = 'checkout_abandonment'),
  COALESCE(SUM(CASE WHEN e.event_type = 'purchase_approved' THEN e.order_value ELSE 0 END), 0)
FROM genesis_cakto_events e
INNER JOIN genesis_instance_integrations i ON i.instance_id = e.instance_id AND i.provider = 'cakto'
GROUP BY e.instance_id, i.id, DATE(e.created_at)
ON CONFLICT (instance_id, date) DO UPDATE SET
  checkouts_started = EXCLUDED.checkouts_started,
  purchases_approved = EXCLUDED.purchases_approved,
  purchases_refused = EXCLUDED.purchases_refused,
  purchases_refunded = EXCLUDED.purchases_refunded,
  cart_abandonments = EXCLUDED.cart_abandonments,
  total_revenue = EXCLUDED.total_revenue,
  updated_at = NOW();