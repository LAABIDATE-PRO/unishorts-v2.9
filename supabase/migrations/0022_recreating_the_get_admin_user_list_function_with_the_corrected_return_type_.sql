CREATE OR REPLACE FUNCTION public.get_admin_user_list()
 RETURNS TABLE(id uuid, first_name text, last_name text, email text, university_email text, institution_name text, role text, account_status text, last_sign_in_at timestamp with time zone, avatar_url text, film_count bigint, total_views bigint, username text, field_of_study text, short_bio text, phone_number text, created_at timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    SELECT
        p.id,
        p.first_name,
        p.last_name,
        u.email,
        p.university_email,
        p.institution_name,
        p.role,
        p.account_status,
        u.last_sign_in_at,
        p.avatar_url,
        (SELECT COUNT(*) FROM public.films WHERE films.user_id = p.id) AS film_count,
        (SELECT COALESCE(SUM(f.view_count), 0::bigint) FROM public.films f WHERE f.user_id = p.id) AS total_views,
        p.username,
        p.field_of_study,
        p.short_bio,
        p.phone_number,
        p.created_at
    FROM
        public.profiles p
    JOIN
        auth.users u ON p.id = u.id
    ORDER BY
        p.created_at DESC;
$function$