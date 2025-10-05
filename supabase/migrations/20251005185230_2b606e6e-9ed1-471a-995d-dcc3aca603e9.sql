-- Add new columns to plan_tasks table for enhanced task tracking
ALTER TABLE public.plan_tasks
ADD COLUMN IF NOT EXISTS post_title TEXT,
ADD COLUMN IF NOT EXISTS post_description TEXT,
ADD COLUMN IF NOT EXISTS script_completed BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS content_created BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS content_edited BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS content_published BOOLEAN DEFAULT false NOT NULL;