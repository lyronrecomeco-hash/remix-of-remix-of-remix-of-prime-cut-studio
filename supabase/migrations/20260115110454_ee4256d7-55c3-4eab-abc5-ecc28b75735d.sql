-- Enable pg_cron and pg_net extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Grant usage on cron schema to postgres
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Drop existing job if exists to avoid duplicates
SELECT cron.unschedule('prospect-automation-scheduler') 
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'prospect-automation-scheduler'
);

-- Schedule the automation scheduler to run every minute
SELECT cron.schedule(
  'prospect-automation-scheduler',
  '* * * * *', -- every minute
  $$
  SELECT net.http_post(
    url := 'https://xeloigymjjeejvicadar.supabase.co/functions/v1/prospect-automation-scheduler',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbG9pZ3ltamplZWp2aWNhZGFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MzQ4OTYsImV4cCI6MjA4MzMxMDg5Nn0.OtCuFQNaYs5QLu3sq1ZRnHlEA1fH2VLje0h959jaAek"}'::jsonb,
    body := '{"trigger": "cron"}'::jsonb
  ) AS request_id;
  $$
);