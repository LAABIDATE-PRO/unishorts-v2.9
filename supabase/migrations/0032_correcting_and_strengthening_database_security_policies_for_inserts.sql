-- Securing 'favorites' table inserts
ALTER POLICY "Users can insert their own favorites." ON public.favorites
WITH CHECK (auth.uid() = user_id);

-- Securing 'likes' table inserts
ALTER POLICY "Users can insert their own likes." ON public.likes
WITH CHECK (auth.uid() = user_id);

-- Securing 'comments' table inserts
ALTER POLICY "Users can insert their own comments." ON public.comments
WITH CHECK (auth.uid() = user_id);

-- Securing 'films' table inserts
ALTER POLICY "Users can insert their own films." ON public.films
WITH CHECK (auth.uid() = user_id);

-- Securing 'profiles' table inserts (Corrected policy name)
ALTER POLICY "Users can insert their own profile" ON public.profiles
WITH CHECK (auth.uid() = id);