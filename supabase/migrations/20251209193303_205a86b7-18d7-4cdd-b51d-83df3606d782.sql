-- Drop existing SELECT policy and recreate with explicit authenticated role restriction
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Also fix the contact_messages table (second finding)
DROP POLICY IF EXISTS "Users can view their own messages" ON public.contact_messages;

CREATE POLICY "Users can view their own messages" 
ON public.contact_messages 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);