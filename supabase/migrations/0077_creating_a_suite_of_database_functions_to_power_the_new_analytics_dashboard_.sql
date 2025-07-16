-- Function to get overview stats
CREATE OR REPLACE FUNCTION get_analytics_overview()
RETURNS TABLE(total_views BIGINT, unique_visitors BIGINT, total_films BIGINT, total_users BIGINT)
LANGUAGE sql
SECURITY DEFINER SET search_path = 'public'
AS $$
SELECT
    (SELECT SUM(view_count) FROM public.films) as total_views,
    (SELECT COUNT(DISTINCT user_id) + COUNT(DISTINCT anonymous_id) FROM public.film_views WHERE user_id IS NOT NULL OR anonymous_id IS NOT NULL) as unique_visitors,
    (SELECT COUNT(*) FROM public.films) as total_films,
    (SELECT COUNT(*) FROM public.profiles) as total_users
$$;

-- Function to get top films
CREATE OR REPLACE FUNCTION get_top_films_analytics(limit_count INT)
RETURNS TABLE(title TEXT, views BIGINT, avg_watch_percentage NUMERIC)
LANGUAGE sql
SECURITY DEFINER SET search_path = 'public'
AS $$
SELECT
    f.title,
    f.view_count as views,
    COALESCE(AVG(fv.watch_percentage), 0) as avg_watch_percentage
FROM public.films f
LEFT JOIN public.film_views fv ON f.id = fv.film_id
WHERE f.view_count > 0
GROUP BY f.id, f.title, f.view_count
ORDER BY f.view_count DESC
LIMIT limit_count;
$$;

-- Function to get top countries
CREATE OR REPLACE FUNCTION get_top_countries_analytics(limit_count INT)
RETURNS TABLE(country TEXT, views BIGINT)
LANGUAGE sql
SECURITY DEFINER SET search_path = 'public'
AS $$
SELECT
    country,
    COUNT(*) as views
FROM public.film_views
WHERE country IS NOT NULL AND country <> 'Unknown'
GROUP BY country
ORDER BY views DESC
LIMIT limit_count;
$$;

-- Function to get device breakdown
CREATE OR REPLACE FUNCTION get_device_breakdown_analytics()
RETURNS TABLE(device_type TEXT, views BIGINT)
LANGUAGE sql
SECURITY DEFINER SET search_path = 'public'
AS $$
SELECT
    COALESCE(device_type, 'Unknown') as device_type,
    COUNT(*) as views
FROM public.film_views
GROUP BY COALESCE(device_type, 'Unknown');
$$;

-- Function to get top institutions
CREATE OR REPLACE FUNCTION get_top_institutions_analytics(limit_count INT)
RETURNS TABLE(institution_name TEXT, views BIGINT)
LANGUAGE sql
SECURITY DEFINER SET search_path = 'public'
AS $$
SELECT
    p.institution_name,
    COUNT(fv.id) as views
FROM public.film_views fv
JOIN public.profiles p ON fv.user_id = p.id
WHERE p.institution_name IS NOT NULL
GROUP BY p.institution_name
ORDER BY views DESC
LIMIT limit_count;
$$;

-- Function to get views timeseries
CREATE OR REPLACE FUNCTION get_views_timeseries_analytics(days_limit INT)
RETURNS TABLE(date TEXT, views BIGINT)
LANGUAGE sql
SECURITY DEFINER SET search_path = 'public'
AS $$
SELECT
    TO_CHAR(DATE(created_at), 'YYYY-MM-DD') as date,
    COUNT(*) as views
FROM public.film_views
WHERE created_at >= NOW() - (days_limit || ' days')::INTERVAL
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) ASC;
$$;