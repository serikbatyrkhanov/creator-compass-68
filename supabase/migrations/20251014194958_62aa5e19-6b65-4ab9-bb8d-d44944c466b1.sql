-- Add email notification fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_email_sent_date DATE,
ADD COLUMN IF NOT EXISTS notification_time TIME DEFAULT '09:00:00';

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.notification_time IS 'User preferred time to receive daily notifications (both SMS and email)';

-- Update existing users to have default notification time
UPDATE public.profiles 
SET notification_time = '09:00:00' 
WHERE notification_time IS NULL;