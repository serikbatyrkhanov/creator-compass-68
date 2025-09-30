-- Create quiz_responses table to store user quiz answers and results
CREATE TABLE public.quiz_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  primary_archetype TEXT NOT NULL,
  secondary_archetype TEXT,
  archetype_scores JSONB NOT NULL,
  selected_topics TEXT[],
  time_bucket TEXT,
  gear TEXT[],
  target_audience TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own quiz responses (or all if not logged in for demo purposes)
CREATE POLICY "Users can view their own quiz responses"
ON public.quiz_responses
FOR SELECT
USING (
  auth.uid() IS NULL OR auth.uid() = user_id
);

-- Policy: Anyone can insert quiz responses (logged in or not)
CREATE POLICY "Anyone can create quiz responses"
ON public.quiz_responses
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_quiz_responses_user_id ON public.quiz_responses(user_id);
CREATE INDEX idx_quiz_responses_created_at ON public.quiz_responses(created_at DESC);