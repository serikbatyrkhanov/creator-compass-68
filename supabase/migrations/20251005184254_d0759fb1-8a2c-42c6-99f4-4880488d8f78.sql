-- Fix search_path for functions by recreating them with proper settings

-- Drop trigger and function for plan_tasks
DROP TRIGGER IF EXISTS plan_tasks_updated_at ON public.plan_tasks;
DROP FUNCTION IF EXISTS update_plan_tasks_updated_at();

CREATE OR REPLACE FUNCTION update_plan_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public;

CREATE TRIGGER plan_tasks_updated_at
  BEFORE UPDATE ON public.plan_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_plan_tasks_updated_at();

-- Drop trigger and function for chat_messages (correct trigger name)
DROP TRIGGER IF EXISTS update_conversation_on_message ON public.chat_messages;
DROP FUNCTION IF EXISTS update_conversation_timestamp();

CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chat_conversations 
  SET updated_at = now() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();