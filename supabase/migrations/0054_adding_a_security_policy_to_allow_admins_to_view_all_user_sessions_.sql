CREATE POLICY "Admins can view all user sessions"
ON public.user_sessions FOR SELECT
USING ( ( SELECT profiles.role
   FROM profiles
  WHERE (profiles.id = auth.uid())) = ANY (ARRAY['admin'::text, 'moderator'::text]) );