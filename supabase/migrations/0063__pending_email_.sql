-- Create the missing trigger to automatically update profile status on email verification
CREATE OR REPLACE TRIGGER on_auth_user_email_verified
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE PROCEDURE public.handle_email_verification();

-- One-time fix for existing users who are stuck in 'pending_email_verification'
-- This script finds users who have verified their email but their status was not updated, and corrects it.
UPDATE public.profiles p
SET account_status = 'pending_admin_approval'
WHERE
  p.account_status = 'pending_email_verification'
  AND EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.id = p.id AND u.email_confirmed_at IS NOT NULL
  );