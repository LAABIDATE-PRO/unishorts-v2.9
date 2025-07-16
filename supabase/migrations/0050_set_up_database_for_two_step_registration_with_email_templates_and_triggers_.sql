-- Insert email templates for the new verification flow
INSERT INTO public.email_templates (name, subject, body, is_enabled)
VALUES
('user_verification', 'Activate Your UniShorts Account', '<h1>Welcome to UniShorts!</h1><p>Hi {{ .User.UserMetadata.first_name }},</p><p>Thanks for signing up. Please click the button below to activate your account and begin the approval process.</p><p><a href="{{ .ConfirmationURL }}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Activate My Account</a></p><p>If you did not sign up for this account, you can ignore this email.</p>', true),
('account_approved', 'Your UniShorts Account is Approved!', '<h1>Congratulations!</h1><p>Hi {{ .User.UserMetadata.first_name }},</p><p>Your account has been approved by our team. You can now log in and access all the features of UniShorts.</p><p><a href="{{ .SiteURL }}/login" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Log In Now</a></p>', true),
('account_rejected', 'Update on Your UniShorts Account', '<h1>Account Update</h1><p>Hi {{ .User.UserMetadata.first_name }},</p><p>Thank you for your interest in UniShorts. After reviewing your application, we are unable to approve your account at this time.</p><p><strong>Reason:</strong> {{ .Reason }}</p><p>If you believe this is a mistake, please contact our support team.</p>', true)
ON CONFLICT (name) DO NOTHING;

-- Function to update profile status on email verification
CREATE OR REPLACE FUNCTION public.handle_email_verification()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Check if the email was just confirmed
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    -- Update the corresponding profile's status
    UPDATE public.profiles
    SET account_status = 'pending_admin_approval'
    WHERE id = NEW.id AND account_status = 'pending_email_verification';
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger the function when a user is updated
DROP TRIGGER IF EXISTS on_auth_user_verified ON auth.users;
CREATE TRIGGER on_auth_user_verified
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_email_verification();