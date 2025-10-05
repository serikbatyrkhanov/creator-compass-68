-- Add notes column to plan_tasks table
ALTER TABLE public.plan_tasks 
ADD COLUMN notes TEXT DEFAULT '';

-- Add updated_at column to track when tasks are modified
ALTER TABLE public.plan_tasks 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_plan_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER plan_tasks_updated_at
  BEFORE UPDATE ON public.plan_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_plan_tasks_updated_at();