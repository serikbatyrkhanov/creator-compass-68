-- Fix critical security vulnerability: Remove public read access from quiz_responses table
-- This prevents unauthorized users from accessing sensitive user data including
-- content preferences, target audiences, and behavioral information

-- Drop the existing policy that allows public read access
DROP POLICY IF EXISTS "Users can view their own quiz responses" ON public.quiz_responses;

-- Create new policy that restricts access to authenticated users only
CREATE POLICY "Users can view their own quiz responses"
ON public.quiz_responses
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);