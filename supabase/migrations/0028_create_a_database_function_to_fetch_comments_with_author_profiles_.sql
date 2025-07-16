CREATE OR REPLACE FUNCTION public.get_comments_with_profiles(film_id_input uuid)
RETURNS TABLE (
    id uuid,
    user_id uuid,
    film_id uuid,
    content text,
    created_at timestamp with time zone,
    parent_comment_id uuid,
    profiles jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        c.id,
        c.user_id,
        c.film_id,
        c.content,
        c.created_at,
        c.parent_comment_id,
        jsonb_build_object(
            'id', p.id,
            'username', p.username,
            'first_name', p.first_name,
            'last_name', p.last_name,
            'short_bio', p.short_bio,
            'avatar_url', p.avatar_url,
            'created_at', p.created_at,
            'university_email', p.university_email,
            'institution_name', p.institution_name,
            'phone_number', p.phone_number,
            'role', p.role,
            'account_status', p.account_status
        ) as profiles
    FROM
        comments AS c
    LEFT JOIN
        profiles AS p ON c.user_id = p.id
    WHERE
        c.film_id = film_id_input
    ORDER BY
        c.created_at DESC;
$$;