CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  -- Insert the new user's profile with an 'active' status
  INSERT INTO public.profiles (id, first_name, last_name, username, university_email, institution_name, field_of_study, short_bio, phone_number, role, account_status)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'university_email',
    new.raw_user_meta_data ->> 'institution_name',
    new.raw_user_meta_data ->> 'field_of_study',
    new.raw_user_meta_data ->> 'short_bio',
    new.raw_user_meta_data ->> 'phone_number',
    'user',
    'active' -- Set account status to active
  );

  -- No notification is sent as the user is auto-approved.

  RETURN new;
END;
$$;