CREATE OR REPLACE FUNCTION public.get_film_by_id_for_admin(film_id_input uuid)
RETURNS SETOF public.films
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the current user is an admin or moderator
  IF (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator') THEN
    RETURN QUERY SELECT * FROM public.films WHERE id = film_id_input;
  ELSE
    -- Fallback to regular RLS for non-admins
    RETURN QUERY SELECT * FROM public.films WHERE id = film_id_input AND (visibility = 'public' OR user_id = auth.uid());
  END IF;
END;
$$;