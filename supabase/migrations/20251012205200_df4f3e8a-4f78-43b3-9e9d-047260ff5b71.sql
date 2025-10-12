-- Add timezone and SMS notification settings to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'America/New_York',
ADD COLUMN IF NOT EXISTS sms_notifications_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS last_sms_sent_date date DEFAULT NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_sms_enabled 
ON public.profiles(sms_notifications_enabled) 
WHERE sms_notifications_enabled = true;

CREATE INDEX IF NOT EXISTS idx_profiles_timezone 
ON public.profiles(timezone);

-- Comments for documentation
COMMENT ON COLUMN public.profiles.timezone 
IS 'User timezone in IANA format (e.g., America/New_York, Europe/London)';

COMMENT ON COLUMN public.profiles.sms_notifications_enabled 
IS 'Whether user wants to receive SMS reminders for tasks';

COMMENT ON COLUMN public.profiles.last_sms_sent_date 
IS 'Date when last SMS reminder was sent (prevents duplicate sends)';

-- Enable required extensions for cron job
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule hourly check (runs at the top of every hour)
SELECT cron.schedule(
  'send-task-reminders-hourly',
  '0 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://ecvjkkrsbladfplgvzuc.supabase.co/functions/v1/send-task-reminders',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdmpra3JzYmxhZGZwbGd2enVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNjIyODUsImV4cCI6MjA3NDczODI4NX0.AaS3rQoNHcicWv59RIFrCeQgzigiMuLnh-TSEE-5c9g"}'::jsonb,
      body := '{}'::jsonb
    ) as request_id;
  $$
);