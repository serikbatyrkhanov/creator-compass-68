-- Phase 1: Create Role System and Blog Post Tables

-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. Grant admin role to the admin user
INSERT INTO public.user_roles (user_id, role)
VALUES ('59cfe1e7-97c2-4065-b302-5ea528977ed3', 'admin');

-- 5. Create blog_posts table
CREATE TABLE public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image_url TEXT,
    author_id UUID REFERENCES public.profiles(id) NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    view_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE
);

-- Enable RLS on blog_posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_posts - Admins can manage all posts
CREATE POLICY "Admins can manage all posts"
ON public.blog_posts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policy for blog_posts - Users can view published posts
CREATE POLICY "Users can view published posts"
ON public.blog_posts
FOR SELECT
TO authenticated
USING (status = 'published');

-- 6. Create blog_post_images table
CREATE TABLE public.blog_post_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on blog_post_images
ALTER TABLE public.blog_post_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_post_images
CREATE POLICY "Admins can manage images"
ON public.blog_post_images
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view images"
ON public.blog_post_images
FOR SELECT
TO authenticated
USING (TRUE);

-- 7. Create slider_images table for dynamic slider management
CREATE TABLE public.slider_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    alt_text TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    used_in_pages TEXT[] DEFAULT ARRAY['home'],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on slider_images
ALTER TABLE public.slider_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for slider_images
CREATE POLICY "Admins can manage slider images"
ON public.slider_images
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view active images"
ON public.slider_images
FOR SELECT
TO public
USING (is_active = TRUE);

-- 8. Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('blog-images', 'blog-images', true),
  ('slider-images', 'slider-images', true)
ON CONFLICT (id) DO NOTHING;

-- 9. Storage RLS policies for blog-images bucket
CREATE POLICY "Admins can upload blog images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog-images' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update blog images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete blog images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view blog images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'blog-images');

-- 10. Storage RLS policies for slider-images bucket
CREATE POLICY "Admins can upload slider images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'slider-images' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update slider images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'slider-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete slider images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'slider-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view slider images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'slider-images');

-- 11. Create trigger for blog_posts updated_at
CREATE OR REPLACE FUNCTION public.update_blog_posts_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_blog_posts_updated_at();