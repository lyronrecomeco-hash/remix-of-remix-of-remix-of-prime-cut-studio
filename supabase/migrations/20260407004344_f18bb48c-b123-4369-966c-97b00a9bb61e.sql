-- Delete duplicate pending payment
DELETE FROM checkout_payments WHERE id = '34713cb4-9da3-4547-96ad-662f3c98ca87';

-- Create genesis_user for the admin (who also bought a plan)
INSERT INTO genesis_users (auth_user_id, name, email, phone, is_active)
VALUES ('0ea30c60-c465-448f-a180-e9ce445ab724', 'SANTIAGO DOS SANTOS CANOSSA', 'santicanossa@gmail.com', '554198614347', true)
ON CONFLICT (auth_user_id) DO NOTHING;

-- Create subscription with 30-day access
INSERT INTO genesis_subscriptions (user_id, plan, plan_name, status, max_instances, max_flows, user_type, started_at, expires_at)
SELECT gu.id, 'starter', 'Plano Mensal', 'active', 3, 10, 'client', 
  '2026-04-06T21:35:30Z'::timestamptz,
  ('2026-04-06T21:35:30Z'::timestamptz + interval '30 days')
FROM genesis_users gu WHERE gu.auth_user_id = '0ea30c60-c465-448f-a180-e9ce445ab724'
ON CONFLICT DO NOTHING;