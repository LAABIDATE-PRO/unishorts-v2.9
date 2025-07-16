-- Step 1: Add the missing column to the profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_status text DEFAULT 'active'::text;

-- Step 2: Drop the old function if it exists
DROP FUNCTION IF EXISTS public.get_all_user_profiles();

-- Step 3: Recreate the function with the correct structure
CREATE FUNCTION public.get_all_user_profiles()
RETURNS TABLE(
    id uuid,
    username text,
    first_name text,
    last_name text,
    institution_name text,
    created_at timestamp with time zone,
    account_status text,
    film_count bigint,
    avatar_url text,
    role text,
    phone_number text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
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
        p.role,
        p.phone_number
    FROM
        profiles p
    ORDER BY
        p.created_at DESC;
$$;