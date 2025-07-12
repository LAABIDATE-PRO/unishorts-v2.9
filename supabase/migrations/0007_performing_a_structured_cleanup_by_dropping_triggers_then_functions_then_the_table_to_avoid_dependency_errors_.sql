-- Step 1: Drop all known triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS on_settings_update ON public.platform_settings;

-- Step 2: Drop the functions now that triggers are gone
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_updated_at();

-- Step 3: Finally, drop the table
DROP TABLE IF EXISTS public.profiles;