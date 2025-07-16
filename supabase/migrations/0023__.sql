-- Create platform_settings table
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id smallint PRIMARY KEY DEFAULT 1,
  logo_url text,
  primary_color text,
  privacy_policy text,
  terms_of_use text,
  contact_email text,
  welcome_message text,
  film_rejection_template text,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT singleton_check CHECK (id = 1)
);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Platform settings are viewable by everyone." ON public.platform_settings;
CREATE POLICY "Platform settings are viewable by everyone." ON public.platform_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update platform settings." ON public.platform_settings;
CREATE POLICY "Admins can update platform settings." ON public.platform_settings
  FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Apply the updated_at trigger
CREATE TRIGGER on_settings_update
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Insert a default row if it doesn't exist
INSERT INTO public.platform_settings (id, primary_color, privacy_policy, terms_of_use, contact_email, welcome_message, film_rejection_template)
VALUES (
  1,
  '#FF5500',
  'Your privacy policy content goes here. Please edit this from the admin panel.',
  'Your terms of use content goes here. Please edit this from the admin panel.',
  'contact@unishorts.com',
  'Welcome to UniShorts! We are excited to have you on our platform.',
  'Thank you for your submission. Unfortunately, your film was not approved at this time for the following reason: {{reason}}'
) ON CONFLICT (id) DO NOTHING;