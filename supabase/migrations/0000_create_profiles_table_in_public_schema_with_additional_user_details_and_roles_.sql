CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  username TEXT UNIQUE,
  university_email TEXT,
  institution_name TEXT,
  is_university_verified BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'user', -- 'user', 'creator', 'admin'
  PRIMARY KEY (id)
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles for select using ( true );

create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );

create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );