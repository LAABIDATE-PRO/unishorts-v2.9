ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;