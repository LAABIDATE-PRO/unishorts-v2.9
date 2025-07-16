INSERT INTO storage.buckets (id, name, public)
VALUES ('screenshots', 'screenshots', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow authenticated users to upload screenshots"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'screenshots');

CREATE POLICY "Allow anyone to view screenshots"
ON storage.objects FOR SELECT
USING (bucket_id = 'screenshots');