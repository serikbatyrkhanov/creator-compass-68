-- Add platform column to plan_tasks table
ALTER TABLE public.plan_tasks
ADD COLUMN IF NOT EXISTS platform text;