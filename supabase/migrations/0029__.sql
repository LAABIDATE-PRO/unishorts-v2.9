CREATE OR REPLACE FUNCTION public.get_film_with_profile(film_id_input uuid)
RETURNS TABLE(
    id uuid,
    user_id uuid,
    title text,
    description text,
    thumbnail_url text,
    video_url text,
    view_count integer,
    created_at timestamp with time zone,
    status text,
    language text,
    genre text,
    duration_minutes integer,
    tags text,
    director_names text,
    institution text,
    release_date date,
    production_year integer,
    filming_country text,
    trailer_url text,
    subtitles text[],
    submission_notes text,
    visibility text,
    rejection_reason text,
    first_name text,
    last_name text,
    avatar_url text,
    username text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        f.id,
        f.user_id,
        f.title,
        f.description,
        f.thumbnail_url,
        f.video_url,
        f.view_count,
        f.created_at,
        f.status,
        f.language,
        f.genre,
        f.duration_minutes,
        f.tags,
        f.director_names,
        f.institution,
        f.release_date,
        f.production_year,
        f.filming_country,
        f.trailer_url,
        f.subtitles,
        f.submission_notes,
        f.visibility,
        f.rejection_reason,
        p.first_name,
        p.last_name,
        p.avatar_url,
        p.username
    FROM
        films f
    LEFT JOIN
        profiles p ON f.user_id = p.id
    WHERE
        f.id = film_id_input;
$$;