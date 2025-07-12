CREATE OR REPLACE FUNCTION public.increment(row_id uuid, x integer, column_name text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  EXECUTE format('UPDATE public.films SET %I = %I + %s WHERE id = %L', column_name, column_name, x, row_id);
END;
$$;