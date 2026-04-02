
ALTER TABLE genesis_cakto_events DROP CONSTRAINT genesis_cakto_events_event_type_check;
ALTER TABLE genesis_cakto_events ADD CONSTRAINT genesis_cakto_events_event_type_check 
  CHECK (event_type = ANY (ARRAY[
    'initiate_checkout', 'checkout_abandonment', 
    'purchase_approved', 'purchase_refused', 'purchase_refunded', 'purchase_chargeback',
    'pix_generated', 'pix_expired', 
    'boleto_generated', 'boleto_expired',
    'subscription_active', 'subscription_cancelled', 'subscription_overdue'
  ]));
