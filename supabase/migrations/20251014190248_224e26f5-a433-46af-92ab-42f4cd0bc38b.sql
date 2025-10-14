-- Create script_documents table for storing detailed script content
CREATE TABLE script_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES plan_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Document content (stored as JSON with text blocks, images, drawings)
  content JSONB DEFAULT '{"version": "6.0.0", "objects": []}'::jsonb,
  
  -- Metadata
  title TEXT NOT NULL DEFAULT 'Untitled Script',
  last_edited_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Version tracking
  version INTEGER DEFAULT 1,
  
  UNIQUE(task_id)
);

-- Enable RLS
ALTER TABLE script_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own script documents"
  ON script_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own script documents"
  ON script_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own script documents"
  ON script_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own script documents"
  ON script_documents FOR DELETE
  USING (auth.uid() = user_id);

-- Add indexes for faster lookups
CREATE INDEX idx_script_documents_task_id ON script_documents(task_id);
CREATE INDEX idx_script_documents_user_id ON script_documents(user_id);