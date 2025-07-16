-- Add new columns to profiles table for visibility and social links
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'public' NOT NULL,
ADD COLUMN IF NOT EXISTS social_media_links JSONB,
ADD COLUMN IF NOT EXISTS auto_save_favorites BOOLEAN DEFAULT FALSE NOT NULL;

-- Add a check constraint for visibility options
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_profile_visibility_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_profile_visibility_check
CHECK (profile_visibility IN ('public', 'private', 'followers_only'));

-- Create table for blocked users
CREATE TABLE IF NOT EXISTS public.blocked_users (
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (blocker_id, blocked_id)
);
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own block list" ON public.blocked_users
FOR ALL USING (auth.uid() = blocker_id);

-- Create table for feature suggestions
CREATE TABLE IF NOT EXISTS public.feature_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  suggestion TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.feature_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can insert suggestions" ON public.feature_suggestions
FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can manage suggestions" ON public.feature_suggestions
FOR ALL USING ((SELECT profiles.role FROM profiles WHERE profiles.id = auth.uid()) = 'admin');

-- Create table for support tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  screenshot_url TEXT,
  status TEXT DEFAULT 'open' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own tickets" ON public.support_tickets
FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage tickets" ON public.support_tickets
FOR ALL USING ((SELECT profiles.role FROM profiles WHERE profiles.id = auth.uid()) = 'admin');