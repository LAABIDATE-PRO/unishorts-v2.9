CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  admin_user RECORD;
BEGIN
  -- Insert the new user's profile with a 'pending' status
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
    'pending' -- Set account status to pending
  );

  -- Create a notification for all admins and moderators
  FOR admin_user IN SELECT id FROM profiles WHERE role IN ('admin', 'moderator')
  LOOP
    INSERT INTO public.notifications (user_id, type, message, url, related_entity_id)
    VALUES (
      admin_user.id,
      'new_submission', -- Re-using this type for new user registration
      'New user registration from ' || (new.raw_user_meta_data ->> 'first_name') || ' ' || (new.raw_user_meta_data ->> 'last_name') || ' is awaiting approval.',
      '/admin/users',
      new.id
    );
  END LOOP;

  RETURN new;
END;
$function$