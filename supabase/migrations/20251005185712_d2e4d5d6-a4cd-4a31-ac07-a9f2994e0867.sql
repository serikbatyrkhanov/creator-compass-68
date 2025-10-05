-- Add posting preferences and start date to content plans
ALTER TABLE public.content_plans
ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE NOT NULL,
ADD COLUMN IF NOT EXISTS posting_days TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

-- Add posting preferences to quiz responses
ALTER TABLE public.quiz_responses
ADD COLUMN IF NOT EXISTS posting_days TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];