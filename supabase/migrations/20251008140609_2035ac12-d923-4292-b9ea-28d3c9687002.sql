-- Add UPDATE policy to quiz_responses table
CREATE POLICY "Users can update their own quiz responses"
ON public.quiz_responses
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add DELETE policy to plan_tasks table
CREATE POLICY "Users can delete their own tasks"
ON public.plan_tasks
FOR DELETE
USING (auth.uid() = user_id);