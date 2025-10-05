-- Create table for storing 7-day content plans
CREATE TABLE public.content_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  quiz_response_id UUID REFERENCES public.quiz_responses(id),
  plan JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_plans ENABLE ROW LEVEL SECURITY;

-- Users can view their own plans
CREATE POLICY "Users can view their own plans"
ON public.content_plans
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own plans
CREATE POLICY "Users can create plans"
ON public.content_plans
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own plans
CREATE POLICY "Users can update their own plans"
ON public.content_plans
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own plans
CREATE POLICY "Users can delete their own plans"
ON public.content_plans
FOR DELETE
USING (auth.uid() = user_id);

-- Create table for tracking task completion in plans
CREATE TABLE public.plan_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.content_plans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  day_number INTEGER NOT NULL,
  task_title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plan_tasks ENABLE ROW LEVEL SECURITY;

-- Users can view their own tasks
CREATE POLICY "Users can view their own tasks"
ON public.plan_tasks
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own tasks
CREATE POLICY "Users can create tasks"
ON public.plan_tasks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own tasks
CREATE POLICY "Users can update their own tasks"
ON public.plan_tasks
FOR UPDATE
USING (auth.uid() = user_id);

-- Create table for AI coach chat history
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- Users can view their own conversations
CREATE POLICY "Users can view their own conversations"
ON public.chat_conversations
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create conversations
CREATE POLICY "Users can create conversations"
ON public.chat_conversations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own conversations
CREATE POLICY "Users can update their own conversations"
ON public.chat_conversations
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own conversations
CREATE POLICY "Users can delete their own conversations"
ON public.chat_conversations
FOR DELETE
USING (auth.uid() = user_id);

-- Create table for chat messages
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages from their conversations
CREATE POLICY "Users can view their own messages"
ON public.chat_messages
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create messages
CREATE POLICY "Users can create messages"
ON public.chat_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add updated_at trigger for conversations
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chat_conversations 
  SET updated_at = now() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_on_message
AFTER INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_timestamp();

-- Update generated_ideas table to add favorite column (if not exists)
ALTER TABLE public.generated_ideas 
ADD COLUMN IF NOT EXISTS favorited BOOLEAN NOT NULL DEFAULT false;