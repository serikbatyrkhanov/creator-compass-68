-- Add social media profile URLs to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS youtube_url text,
ADD COLUMN IF NOT EXISTS instagram_url text,
ADD COLUMN IF NOT EXISTS tiktok_url text;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_youtube_url ON public.profiles(youtube_url) WHERE youtube_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_instagram_url ON public.profiles(instagram_url) WHERE instagram_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_tiktok_url ON public.profiles(tiktok_url) WHERE tiktok_url IS NOT NULL;