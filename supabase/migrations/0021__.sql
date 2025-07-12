-- Add rejection_reason column to films table
ALTER TABLE public.films ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Grant admins full access to films table
DROP POLICY IF EXISTS "Admins can manage all films" ON public.films;
CREATE POLICY "Admins can manage all films" ON public.films
AS PERMISSIVE FOR ALL
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');