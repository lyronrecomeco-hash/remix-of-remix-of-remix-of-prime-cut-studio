-- Add plan_name column to genesis_subscriptions
ALTER TABLE genesis_subscriptions 
ADD COLUMN IF NOT EXISTS plan_name TEXT;

-- Update existing records with plan_name based on plan type
UPDATE genesis_subscriptions 
SET plan_name = CASE 
  WHEN plan = 'starter' THEN 'Plano Mensal'
  WHEN plan = 'professional' THEN 'Plano Trimestral'
  WHEN plan = 'enterprise' THEN 'Plano Anual'
  ELSE 'Plano Free'
END
WHERE plan_name IS NULL;