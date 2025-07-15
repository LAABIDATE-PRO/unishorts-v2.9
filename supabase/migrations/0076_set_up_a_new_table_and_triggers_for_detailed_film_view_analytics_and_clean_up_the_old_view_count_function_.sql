-- Create the new table to store detailed view data
CREATE TABLE public.film_views (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  film_id UUID NOT NULL REFERENCES public.films(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  device_type TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  city TEXT,
  duration_watched_seconds INTEGER,
  watch_percentage REAL,
  ip_address INET,
  PRIMARY KEY (id)
);

-- Add indexes for faster lookups
CREATE INDEX idx_film_views_film_id_user_id ON public.film_views(film_id, user_id);
CREATE INDEX idx_film_views_film_id_anonymous_id ON public.film_views(film_id, anonymous_id);

-- Enable Row Level Security
ALTER TABLE public.film_views ENABLE ROW LEVEL SECURITY;

-- Policies for the new table
CREATE POLICY "Allow all for service_role" ON public.film_views FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow admins to view all" ON public.film_views FOR SELECT
TO authenticated
USING (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = ANY (ARRAY['admin'::text, 'moderator'::text]));

-- Function to automatically increment the view_count on the films table
CREATE OR REPLACE FUNCTION public.increment_film_view_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.films
  SET view_count = view_count + 1
  WHERE id = NEW.film_id;
  RETURN NEW;
END;
$$;

-- Trigger to execute the function after a new view is inserted
CREATE TRIGGER on_new_film_view
  AFTER INSERT ON public.film_views
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_film_view_count();

-- Drop the old, inaccurate increment function
DROP FUNCTION IF EXISTS public.increment(row_id uuid, x integer, column_name text);