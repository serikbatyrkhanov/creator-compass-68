-- Add DELETE policies for user data tables to improve privacy and data control

-- 1. Allow users to delete their own contact messages
CREATE POLICY "Users can delete their own messages"
ON public.contact_messages
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 2. Allow users to delete their own chat messages
CREATE POLICY "Users can delete their own messages"
ON public.chat_messages
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- These policies improve user privacy by allowing users to:
-- - Delete accidentally sent sensitive information
-- - Exercise their right to data deletion (GDPR compliance)
-- - Manage their own chat history
-- Note: chat_conversations already has a DELETE policy, so no changes needed there