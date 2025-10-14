-- Add preferred_platform column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN preferred_platform text;

-- Add a comment to document the column
COMMENT ON COLUMN public.profiles.preferred_platform IS 'User preferred platform/format for content creation: youtube_video, youtube_shorts, instagram_post, instagram_reels, or tiktok';