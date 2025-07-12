-- Add account_status column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active';

-- Add a check constraint for the allowed values
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_account_status;
ALTER TABLE public.profiles ADD CONSTRAINT check_account_status CHECK (account_status IN ('active', 'banned'));

-- Grant admins full access to profiles table
DROP POLICY IF EXISTS "Admins can manage user profiles" ON public.profiles;
CREATE POLICY "Admins can manage user profiles" ON public.profiles
AS PERMISSIVE FOR ALL
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Create RPC function to get user list with film count
CREATE OR REPLACE FUNCTION get_all_user_profiles()
RETURNS TABLE (
    id uuid,
    username text,
    first_name text,
    last_name text,
    institution_name text,
    created_at timestamptz,
    account_status text,
    film_count bigint,
    avatar_url text,
    role text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        p.id,
        p.username,
        p.first_name,
        p.last_name,
        p.institution_name,
        p.created_at,
        p.account_status,
        (SELECT COUNT(*) FROM films WHERE films.user_id = p.id) as film_count,
        p.avatar_url,
        p.role
    FROM
        profiles p
    ORDER BY
        p.created_at DESC;
$$;