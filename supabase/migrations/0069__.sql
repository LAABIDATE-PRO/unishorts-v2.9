ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS welcome_popup_shown BOOLEAN DEFAULT FALSE;