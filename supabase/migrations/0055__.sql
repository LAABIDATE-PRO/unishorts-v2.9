CREATE OR REPLACE FUNCTION public.get_active_sessions_with_profiles()
RETURNS TABLE(
    id uuid,
    created_at timestamp with time zone,
    ip_address text,
    device_type text,
    os text,
    browser text,
    country text,
    first_name text,
    last_name text,
    email text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
    SELECT
        s.id,
        s.created_at,
        s.ip_address,
        s.device_type,
        s.os,
        s.browser,
        s.country,
        p.first_name,
        p.last_name,
        u.email
    FROM
        user_sessions s
    LEFT JOIN
        profiles p ON s.user_id = p.id
    LEFT JOIN
        auth.users u ON s.user_id = u.id
    WHERE
        s.is_active = true
    ORDER BY
        s.created_at DESC;
$$;