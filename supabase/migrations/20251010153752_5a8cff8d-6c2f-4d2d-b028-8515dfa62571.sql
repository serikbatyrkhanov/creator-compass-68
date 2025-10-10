-- Fix critical security issue: Require authentication for quiz responses
-- Replace the overly permissive "Anyone can create quiz responses" policy

-- Drop the existing insecure policy
DROP POLICY IF EXISTS "Anyone can create quiz responses" ON public.quiz_responses;

-- Create a secure policy that requires authentication
CREATE POLICY "Authenticated users can create their own quiz responses"
ON public.quiz_responses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Make user_id NOT NULL to prevent anonymous submissions
-- This ensures data integrity and prevents null user_id entries
ALTER TABLE public.quiz_responses 
ALTER COLUMN user_id SET NOT NULL;