-- Add language column to blog_posts table
ALTER TABLE blog_posts 
ADD COLUMN language text NOT NULL DEFAULT 'en';

-- Add a check constraint to ensure only valid language codes
ALTER TABLE blog_posts 
ADD CONSTRAINT blog_posts_language_check 
CHECK (language IN ('en', 'ru'));

-- Create an index for better query performance
CREATE INDEX idx_blog_posts_language ON blog_posts(language);