-- Drop existing log policies and table
DROP POLICY IF EXISTS "Allow service_role to insert logs" ON public.system_logs;
DROP POLICY IF EXISTS "Admins can view logs" ON public.system_logs;
DROP TABLE IF EXISTS public.system_logs;

-- Recreate system_logs table with new structure
CREATE TABLE public.system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT
);

-- Recreate RLS policies
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view logs" ON public.system_logs FOR SELECT USING (( SELECT p.role FROM profiles p WHERE p.id = auth.uid()) = 'admin'::text);
CREATE POLICY "Allow service_role to insert logs" ON public.system_logs FOR INSERT WITH CHECK (true);