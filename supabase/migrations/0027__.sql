CREATE POLICY "Admins and moderators can update any film"
ON public.films
FOR UPDATE
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator') )
WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator') );

CREATE POLICY "Admins and moderators can delete any film"
ON public.films
FOR DELETE
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator') );