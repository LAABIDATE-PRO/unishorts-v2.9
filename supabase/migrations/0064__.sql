-- Drop all previous custom email artifacts to ensure a clean state
DROP TABLE IF EXISTS public.email_templates CASCADE;
DROP FUNCTION IF EXISTS public.create_base_email(text, text, text, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.handle_email_verification() CASCADE; -- Will be recreated

-- Recreate the function that updates profile status upon email verification
CREATE OR REPLACE FUNCTION public.handle_email_verification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  UPDATE public.profiles
  SET account_status = 'pending_admin_approval'
  WHERE id = NEW.id AND account_status = 'pending_email_verification';
  RETURN NEW;
END;
$function$;

-- Recreate the trigger to link email verification to profile status update
CREATE TRIGGER on_auth_user_email_verified
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE PROCEDURE public.handle_email_verification();