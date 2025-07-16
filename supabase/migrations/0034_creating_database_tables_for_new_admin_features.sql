-- Create system_logs table
CREATE TABLE public.system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  details JSONB
);
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view logs" ON public.system_logs FOR SELECT USING (( SELECT profiles.role FROM profiles WHERE profiles.id = auth.uid()) = 'admin'::text);
CREATE POLICY "Allow service_role to insert logs" ON public.system_logs FOR INSERT WITH CHECK (true);

-- Create email_templates table
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER handle_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage email templates" ON public.email_templates FOR ALL USING (( SELECT profiles.role FROM profiles WHERE profiles.id = auth.uid()) = 'admin'::text);

-- Insert default email templates
INSERT INTO public.email_templates (name, subject, body) VALUES
('welcome', 'Welcome to {{platform_name}}!', 'Hi {{username}},\n\nWelcome to {{platform_name}}! We are excited to have you join our community of filmmakers.\n\nBest,\nThe {{platform_name}} Team'),
('film_approved', 'Your film "{{film_title}}" has been approved!', 'Hi {{username}},\n\nGreat news! Your film, "{{film_title}}", has been approved and is now live on {{platform_name}}.\n\nYou can view it here: {{film_url}}\n\nCongratulations!\nThe {{platform_name}} Team'),
('film_rejected', 'Update on your film submission "{{film_title}}"', 'Hi {{username}},\n\nThank you for submitting your film "{{film_title}}" to {{platform_name}}. After careful review, we have decided not to publish it at this time.\n\nReason: {{reason}}\n\nWe encourage you to review the feedback and resubmit if you wish.\n\nBest,\nThe {{platform_name}} Team'),
('password_reset', 'Reset your password for {{platform_name}}', 'Hi {{username}},\n\nSomeone requested a password reset for your account. If this was you, please use the link below to reset your password. The link will expire in one hour.\n\n{{reset_link}}\n\nIf you did not request this, you can safely ignore this email.\n\nBest,\nThe {{platform_name}} Team'),
('new_comment', 'New comment on your film "{{film_title}}"', 'Hi {{username}},\n\n{{commenter_name}} left a comment on your film, "{{film_title}}".\n\n"{{comment_content}}"\n\nYou can view the comment and reply here: {{film_url}}\n\nBest,\nThe {{platform_name}} Team');

-- Create institutions table
CREATE TABLE public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  approved_domains TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage institutions" ON public.institutions FOR ALL USING (( SELECT profiles.role FROM profiles WHERE profiles.id = auth.uid()) = 'admin'::text);
CREATE POLICY "Authenticated users can view institutions" ON public.institutions FOR SELECT USING (auth.role() = 'authenticated');

-- Create permissions tables
CREATE TABLE public.permissions (
  id SERIAL PRIMARY KEY,
  action TEXT NOT NULL UNIQUE,
  description TEXT
);
CREATE TABLE public.role_permissions (
  id SERIAL PRIMARY KEY,
  role TEXT NOT NULL,
  permission_id INTEGER NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  UNIQUE (role, permission_id)
);
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view permissions" ON public.permissions FOR SELECT USING (( SELECT p.role FROM profiles p WHERE p.id = auth.uid()) = 'admin'::text);
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage role permissions" ON public.role_permissions FOR ALL USING (( SELECT p.role FROM profiles p WHERE p.id = auth.uid()) = 'admin'::text);

-- Populate permissions
INSERT INTO public.permissions (action, description) VALUES
('dashboard.view', 'Can view the main admin dashboard'),
('films.manage.all', 'Can view, approve, reject, and delete any film'),
('users.manage.all', 'Can view, edit, and delete any user'),
('settings.manage.platform', 'Can change platform-wide settings'),
('logs.view', 'Can view system logs'),
('emails.manage', 'Can edit email templates'),
('institutions.manage', 'Can manage university list'),
('roles.manage', 'Can manage user roles and permissions');

-- Assign permissions to roles
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin', id FROM public.permissions;
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'moderator', id FROM public.permissions WHERE action IN ('dashboard.view', 'films.manage.all');