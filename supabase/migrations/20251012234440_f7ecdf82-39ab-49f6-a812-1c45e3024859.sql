-- Create referral_links table
CREATE TABLE IF NOT EXISTS public.referral_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL CHECK (code ~ '^[a-z0-9-]+$' AND length(code) <= 50),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  description TEXT NOT NULL CHECK (length(description) <= 255),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  max_uses INTEGER CHECK (max_uses > 0),
  current_uses INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create referral_signups table
CREATE TABLE IF NOT EXISTS public.referral_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_link_id UUID NOT NULL REFERENCES public.referral_links(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signup_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  converted_to_paid BOOLEAN NOT NULL DEFAULT false,
  conversion_date TIMESTAMPTZ,
  UNIQUE(referral_link_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_links_code ON public.referral_links(code);
CREATE INDEX IF NOT EXISTS idx_referral_links_is_active ON public.referral_links(is_active);
CREATE INDEX IF NOT EXISTS idx_referral_signups_referral_link_id ON public.referral_signups(referral_link_id);
CREATE INDEX IF NOT EXISTS idx_referral_signups_user_id ON public.referral_signups(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_signups_converted ON public.referral_signups(converted_to_paid);

-- Enable RLS
ALTER TABLE public.referral_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_signups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_links (admin only)
CREATE POLICY "Admins can manage referral links"
ON public.referral_links
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for referral_signups (admins can read, system can insert)
CREATE POLICY "Admins can view referral signups"
ON public.referral_signups
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create referral signups"
ON public.referral_signups
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);