-- Add a check constraint for roles if it doesn't exist
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS role_check;
ALTER TABLE public.profiles ADD CONSTRAINT role_check CHECK (role IN ('user', 'admin', 'moderator'));

-- Update policy to allow moderators to manage films
DROP POLICY IF EXISTS "Admins can manage all films" ON public.films;
CREATE POLICY "Admins and moderators can manage films" ON public.films
  FOR ALL
  TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator'))
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator'));