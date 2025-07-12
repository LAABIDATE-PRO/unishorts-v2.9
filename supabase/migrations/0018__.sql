ALTER TABLE public.films
ADD COLUMN director_names TEXT,
ADD COLUMN institution TEXT,
ADD COLUMN release_date DATE,
ADD COLUMN production_year INTEGER,
ADD COLUMN filming_country TEXT,
ADD COLUMN trailer_url TEXT,
ADD COLUMN subtitles TEXT[],
ADD COLUMN submission_notes TEXT;