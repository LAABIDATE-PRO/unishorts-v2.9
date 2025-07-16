CREATE OR REPLACE FUNCTION public.get_support_tickets_with_profiles()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  subject text,
  message text,
  screenshot_url text,
  status text,
  created_at timestamptz,
  user_email text,
  user_name text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    st.id,
    st.user_id,
    st.subject,
    st.message,
    st.screenshot_url,
    st.status,
    st.created_at,
    p.university_email AS user_email,
    p.first_name || ' ' || p.last_name AS user_name
  FROM
    support_tickets st
  LEFT JOIN
    profiles p ON st.user_id = p.id
  ORDER BY
    st.created_at DESC;
$$;