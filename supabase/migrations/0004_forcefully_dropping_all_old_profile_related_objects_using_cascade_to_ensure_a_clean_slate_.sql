-- Forcefully drop the functions and all their dependent objects (like triggers)
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Forcefully drop the table and all its dependent objects (like policies)
DROP TABLE IF EXISTS public.profiles CASCADE;