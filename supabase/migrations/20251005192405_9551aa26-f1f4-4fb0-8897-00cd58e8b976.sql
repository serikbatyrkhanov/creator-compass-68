-- Add duration column to content_plans table to store plan length (7 for weekly, 30 for monthly)
ALTER TABLE public.content_plans 
ADD COLUMN duration integer NOT NULL DEFAULT 7;