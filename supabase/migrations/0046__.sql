CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  -- The user profile is now created directly in the 'custom-signup' edge function.
  -- This trigger function is now a no-op to prevent duplicate profile creation.
  RETURN new;
END;
$$;