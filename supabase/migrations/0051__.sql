CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator') )
WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator') );