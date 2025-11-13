-- Remove SMS-related columns from profiles table
ALTER TABLE profiles 
  DROP COLUMN IF EXISTS sms_notifications_enabled,
  DROP COLUMN IF EXISTS sms_consent,
  DROP COLUMN IF EXISTS last_sms_sent_date,
  DROP COLUMN IF EXISTS notification_time,
  DROP COLUMN IF EXISTS phone;