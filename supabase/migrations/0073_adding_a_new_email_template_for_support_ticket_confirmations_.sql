INSERT INTO public.email_templates (name, subject, body, is_enabled)
VALUES (
  'Support Ticket Received',
  'We''ve Received Your Support Request (Ticket #{{ticket_id}})',
  'Hi {{user_name}},<br><br>Thanks for reaching out! This is an automated confirmation that we have successfully received your support request. Our team will review it and get back to you as soon as possible.<br><br><strong>Your Ticket Details:</strong><br><strong>Subject:</strong> {{ticket_subject}}<br><br>You can track the status of your ticket in your dashboard.<br><br>The UniShorts Team',
  true
)
ON CONFLICT (name) 
DO UPDATE SET
  subject = EXCLUDED.subject,
  body = EXCLUDED.body,
  is_enabled = EXCLUDED.is_enabled,
  updated_at = now();