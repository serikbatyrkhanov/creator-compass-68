-- Add time_spent_estimated column to plan_tasks table for user to override the default time estimate
ALTER TABLE public.plan_tasks
ADD COLUMN IF NOT EXISTS time_spent_estimated text;