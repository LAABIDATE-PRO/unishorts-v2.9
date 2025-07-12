DROP POLICY IF EXISTS "Public films are viewable by everyone." ON public.films;
ALTER TABLE public.films DROP COLUMN IF EXISTS is_public;
ALTER TABLE public.films ADD COLUMN visibility TEXT NOT NULL DEFAULT 'public';
CREATE POLICY "Public films are viewable by everyone." ON public.films FOR SELECT USING ((visibility = 'public'::text) OR (auth.uid() = user_id));