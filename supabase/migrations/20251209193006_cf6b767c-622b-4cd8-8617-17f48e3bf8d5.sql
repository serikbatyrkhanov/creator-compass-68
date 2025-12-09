-- Add missing columns to profiles table for SMS notifications and phone

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS sms_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sms_notifications_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_time time DEFAULT '09:00:00';