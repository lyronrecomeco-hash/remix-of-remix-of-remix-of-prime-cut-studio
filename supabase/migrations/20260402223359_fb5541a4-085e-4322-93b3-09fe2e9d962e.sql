
CREATE OR REPLACE FUNCTION public.update_cakto_analytics_on_event()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  event_date DATE;
  integration_uuid UUID;
BEGIN
  event_date := DATE(NEW.created_at);
  integration_uuid := NEW.integration_id;
  
  IF integration_uuid IS NULL THEN
    SELECT id INTO integration_uuid
    FROM genesis_instance_integrations
    WHERE instance_id = NEW.instance_id
      AND provider = 'cakto'
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;

  -- Skip analytics if no integration found (don't block event insert)
  IF integration_uuid IS NULL THEN
    RETURN NEW;
  END IF;

  BEGIN
    INSERT INTO genesis_cakto_analytics (
      instance_id,
      integration_id,
      date,
      checkouts_started,
      purchases_approved,
      purchases_refused,
      purchases_refunded,
      cart_abandonments,
      subscriptions_active,
      subscriptions_cancelled,
      subscriptions_overdue,
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
      CASE WHEN NEW.event_type = 'subscription_active' THEN 1 ELSE 0 END,
      CASE WHEN NEW.event_type = 'subscription_cancelled' THEN 1 ELSE 0 END,
      CASE WHEN NEW.event_type = 'subscription_overdue' THEN 1 ELSE 0 END,
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
      subscriptions_active = genesis_cakto_analytics.subscriptions_active + 
        CASE WHEN NEW.event_type = 'subscription_active' THEN 1 ELSE 0 END,
      subscriptions_cancelled = genesis_cakto_analytics.subscriptions_cancelled + 
        CASE WHEN NEW.event_type = 'subscription_cancelled' THEN 1 ELSE 0 END,
      subscriptions_overdue = genesis_cakto_analytics.subscriptions_overdue + 
        CASE WHEN NEW.event_type = 'subscription_overdue' THEN 1 ELSE 0 END,
      total_revenue = genesis_cakto_analytics.total_revenue + 
        CASE WHEN NEW.event_type = 'purchase_approved' THEN COALESCE(NEW.order_value, 0) ELSE 0 END,
      updated_at = NOW();
  EXCEPTION WHEN OTHERS THEN
    -- Log but don't block event insert
    RAISE WARNING 'Analytics update failed for event %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$function$;
