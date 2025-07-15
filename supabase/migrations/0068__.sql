INSERT INTO public.email_templates (name, subject, body, is_enabled)
VALUES (
  'Account Approved',
  'Your UniShorts Account has been Approved!',
  'Hi {{user_name}},<br><br>Great news! Your account on UniShorts has been approved by our team. You can now log in and start exploring and sharing amazing short films.<br><br><a href="{{login_link}}">Click here to Log In</a><br><br>Welcome to the community!<br><br>The UniShorts Team',
  true
)
ON CONFLICT (name) 
DO UPDATE SET
  subject = EXCLUDED.subject,
  body = EXCLUDED.body,
  is_enabled = EXCLUDED.is_enabled,
  updated_at = now();