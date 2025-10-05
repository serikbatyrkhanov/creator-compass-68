-- Create table for storing AI-generated content ideas
CREATE TABLE public.generated_ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  quiz_response_id UUID REFERENCES public.quiz_responses(id),
  ideas JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  saved BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.generated_ideas ENABLE ROW LEVEL SECURITY;

-- Users can view their own generated ideas
CREATE POLICY "Users can view their own ideas"
ON public.generated_ideas
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own ideas
CREATE POLICY "Users can create ideas"
ON public.generated_ideas
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own ideas
CREATE POLICY "Users can update their own ideas"
ON public.generated_ideas
FOR UPDATE
USING (auth.uid() = user_id);