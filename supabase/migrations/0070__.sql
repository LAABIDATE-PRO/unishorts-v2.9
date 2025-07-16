ALTER TABLE public.profiles
RENAME COLUMN short_bio TO join_reason;

ALTER TABLE public.profiles
ADD COLUMN short_bio TEXT;