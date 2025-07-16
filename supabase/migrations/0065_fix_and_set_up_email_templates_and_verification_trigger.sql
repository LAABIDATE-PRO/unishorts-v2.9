-- Drop the function and any dependent objects like triggers
DROP FUNCTION IF EXISTS public.handle_email_verification() CASCADE;

-- Create the function to update profile status upon email verification
CREATE OR REPLACE FUNCTION public.handle_email_verification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET account_status = 'pending_admin_approval'
  WHERE id = NEW.id AND account_status = 'pending_email_verification';
  RETURN NEW;
END;
$$;

-- Create the trigger to fire the function when a user's email is confirmed
CREATE TRIGGER on_auth_user_verified
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_email_verification();

-- Create email_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Policies for email_templates
DROP POLICY IF EXISTS "Admins can manage email templates" ON public.email_templates;
CREATE POLICY "Admins can manage email templates" ON public.email_templates
  FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Insert default templates for account approval and rejection
INSERT INTO public.email_templates (name, subject, body)
VALUES
  ('Account Approved', 'Welcome to UniShorts! Your Account is Approved', 'Hi {{user_name}},\n\nGreat news! Your account on UniShorts has been approved by our team. You can now log in and start exploring and sharing amazing short films.\n\nLog in here: {{login_link}}\n\nWelcome to the community!\n\nThe UniShorts Team'),
  ('Account Rejected', 'Update on Your UniShorts Account Application', 'Hi {{user_name}},\n\nThank you for your interest in joining UniShorts. After reviewing your application, we are unable to approve your account at this time.\n\nReason: {{reason}}\n\nIf you believe this is a mistake, please contact our support team.\n\nBest regards,\nThe UniShorts Team')
ON CONFLICT (name) DO NOTHING;