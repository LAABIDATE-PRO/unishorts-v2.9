-- Drop the table to ensure a completely clean state
DROP TABLE IF EXISTS public.email_templates;

-- Recreate the table with the correct structure
CREATE TABLE public.email_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  is_enabled boolean NOT NULL DEFAULT true,
  CONSTRAINT email_templates_pkey PRIMARY KEY (id),
  CONSTRAINT email_templates_name_key UNIQUE (name)
);

-- Helper function to create a base template structure
CREATE OR REPLACE FUNCTION public.create_base_email(subject text, preheader text, content_en text, content_ar text, cta_text text, cta_link text)
RETURNS text LANGUAGE plpgsql AS $$
BEGIN
RETURN '<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="utf-8"><meta name="x-apple-disable-message-reformatting"><meta http-equiv="x-ua-compatible" content="ie=edge"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
    <title>' || subject || '</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" media="screen">
    <style>body {font-family: "Inter", sans-serif;} .hover-underline:hover {text-decoration: underline !important;} @media (max-width: 600px) {.sm-w-full {width: 100% !important;} .sm-px-24 {padding-left: 24px !important; padding-right: 24px !important;} .sm-py-32 {padding-top: 32px !important; padding-bottom: 32px !important;}}</style>
</head>
<body style="margin: 0; width: 100%; padding: 0; word-break: break-word; -webkit-font-smoothing: antialiased; background-color: #f3f4f6;">
    <div style="display: none;">' || preheader || '</div>
    <div role="article" aria-roledescription="email" aria-label="' || subject || '" lang="en">
        <table style="width: 100%; font-family: ''Inter'', sans-serif;" cellpadding="0" cellspacing="0" role="presentation">
            <tr><td align="center" style="background-color: #f3f4f6;">
                <table class="sm-w-full" style="width: 600px;" cellpadding="0" cellspacing="0" role="presentation">
                    <tr><td class="sm-py-32 sm-px-24" style="padding: 48px; text-align: center;"><a href="https://reqylowdlhhdgoetcfdg.supabase.co"><h1 style="font-weight: 700; font-size: 24px; color: #1f2937;">UniShorts</h1></a></td></tr>
                    <tr><td align="center" class="sm-px-24"><table style="width: 100%;" cellpadding="0" cellspacing="0" role="presentation">
                        <tr><td class="sm-px-24" style="background-color: #ffffff; border-radius: 4px; padding: 48px; text-align: left;">
                            ' || (CASE WHEN content_ar IS NOT NULL THEN '<div style="direction: rtl; text-align: right;">' || content_ar || '</div><div style="direction: ltr; text-align: left; border-top: 1px solid #e5e7eb; margin-top: 24px; padding-top: 24px;">' || content_en || '</div>' ELSE content_en END) || '
                            ' || (CASE WHEN cta_link IS NOT NULL THEN '<a href="' || cta_link || '" style="display: block; width: 100%; background-color: #2563eb; border-radius: 4px; padding: 16px 24px; font-weight: 700; font-size: 16px; color: #ffffff; text-decoration: none; text-align: center; margin-top: 24px;">' || cta_text || '</a>' ELSE '' END) || '
                        </td></tr>
                        <tr><td style="height: 48px;"></td></tr>
                        <tr><td style="padding-left: 24px; padding-right: 24px; text-align: center; font-size: 12px; color: #6b7280;"><p style="margin: 0;">&copy; ' || extract(year from now()) || ' UniShorts. All Rights Reserved.</p></td></tr>
                    </table></td></tr>
                </table>
            </td></tr>
        </table>
    </div>
</body>
</html>';
END;
$$;

-- Insert all 10 required email templates using the helper function
INSERT INTO public.email_templates (name, subject, body) VALUES
('Account Confirmation', 'Confirm your UniShorts Account | قم بتأكيد حسابك', public.create_base_email('Account Confirmation', 'Please confirm your email address to get started.', '<p style=''margin: 0 0 16px; font-weight: 700; font-size: 20px; color: #000000;''>Welcome, {{user_name}}!</p><p style=''margin: 0 0 24px; font-size: 16px; color: #4b5563;''>Thanks for signing up. Just one more step: please confirm your email address by clicking the button below.</p>', '<p style=''margin: 0 0 16px; font-weight: 700; font-size: 20px; color: #000000;''>أهلاً بك، {{user_name}}!</p><p style=''margin: 0 0 24px; font-size: 16px; color: #4b5563;''>شكراً لتسجيلك. خطوة واحدة فقط تفصلك عن الانضمام لمجتمعنا. يرجى تأكيد بريدك الإلكتروني بالضغط على الزر أدناه.</p>', 'Confirm Email Address', '{{verification_link}}')),
('Account Approved', 'Your UniShorts Account is Approved!', public.create_base_email('Account Approved', 'Welcome aboard! Your account has been approved.', '<p style=''margin: 0 0 16px; font-weight: 700; font-size: 20px; color: #000000;''>Congratulations, {{user_name}}!</p><p style=''margin: 0 0 24px; font-size: 16px; color: #4b5563;''>Your account has been approved. You can now log in and start exploring.</p>', '<p style=''margin: 0 0 16px; font-weight: 700; font-size: 20px; color: #000000;''>تهانينا، {{user_name}}!</p><p style=''margin: 0 0 24px; font-size: 16px; color: #4b5563;''>تمت الموافقة على حسابك. يمكنك الآن تسجيل الدخول والبدء في استكشاف المنصة.</p>', 'Go to Dashboard', '{{login_link}}')),
('Account Rejected', 'Update on Your UniShorts Application', public.create_base_email('Application Update', 'An update on your UniShorts account application.', '<p style=''margin: 0 0 16px; font-weight: 700; font-size: 20px; color: #000000;''>Hello, {{user_name}}</p><p style=''margin: 0 0 24px; font-size: 16px; color: #4b5563;''>Thank you for your interest. Unfortunately, we could not approve your application at this time. Reason: {{reason}}</p>', '<p style=''margin: 0 0 16px; font-weight: 700; font-size: 20px; color: #000000;''>مرحباً، {{user_name}}</p><p style=''margin: 0 0 24px; font-size: 16px; color: #4b5563;''>شكراً لاهتمامك بالانضمام. للأسف، لم نتمكن من الموافقة على طلبك في الوقت الحالي. سبب الرفض: {{reason}}</p>', 'Contact Support', 'mailto:support@unishorts.app')),
('Password Reset', 'Reset Your UniShorts Password', public.create_base_email('Password Reset', 'A request was made to reset your password.', '<p style=''margin: 0 0 24px; font-size: 16px; color: #4b5563;''>We received a request to reset your password. Click the button below to proceed. If you did not request this, you can safely ignore this email.</p>', NULL, 'Reset Password', '{{reset_link}}')),
('Password Changed', 'Your UniShorts Password Was Changed', public.create_base_email('Password Changed', 'Your password has been successfully changed.', '<p style=''margin: 0 0 24px; font-size: 16px; color: #4b5563;''>Your password was changed successfully. If you did not make this change, please secure your account immediately.</p>', NULL, 'Secure Your Account', '{{secure_link}}')),
('New Login Alert', 'New Login to Your UniShorts Account', public.create_base_email('New Login Alert', 'A new device has logged into your account.', '<p style=''margin: 0 0 16px; font-size: 16px; color: #4b5563;''>We detected a new login to your account:</p><ul style=''padding-left: 20px; color: #4b5563;''><li><strong>Device:</strong> {{device_type}}</li><li><strong>Browser:</strong> {{browser}}</li><li><strong>Location:</strong> {{location}}</li><li><strong>Time:</strong> {{time}}</li></ul><p style=''margin: 16px 0 0; font-size: 16px; color: #4b5563;''>If this was not you, please reset your password immediately.</p>', NULL, 'Reset Password', '{{reset_link}}')),
('Film Submission Confirmation', 'We''ve Received Your Film!', public.create_base_email('Film Received', 'Your film has been submitted for review.', '<p style=''margin: 0 0 16px; font-weight: 700; font-size: 20px; color: #000000;''>Thanks for submitting ''{{film_title}}''!</p><p style=''margin: 0 0 24px; font-size: 16px; color: #4b5563;''>We''ve received your film and it is now in our review queue. You can expect to hear back from us within 72 hours. You can check its status on your dashboard.</p>', NULL, 'View Dashboard', '{{dashboard_link}}')),
('Film Approved', 'Your Film is Live!', public.create_base_email('Film Approved', 'Congratulations, your film is now live on UniShorts!', '<p style=''margin: 0 0 16px; font-weight: 700; font-size: 20px; color: #000000;''>Congratulations, {{user_name}}!</p><p style=''margin: 0 0 24px; font-size: 16px; color: #4b5563;''>Your film, ''{{film_title}}'', has been approved and is now live on the platform. Share it with the world!</p>', NULL, 'View Your Film', '{{film_link}}')),
('Film Rejected', 'Update on Your Film Submission', public.create_base_email('Film Submission Update', 'An update on your film submission.', '<p style=''margin: 0 0 16px; font-weight: 700; font-size: 20px; color: #000000;''>Update on ''{{film_title}}''</p><p style=''margin: 0 0 24px; font-size: 16px; color: #4b5563;''>Thank you for your submission. After careful review, we were unable to approve your film at this time for the following reason: {{reason}}</p><p style=''margin: 16px 0 0; font-size: 16px; color: #4b5563;''>We encourage you to make adjustments and resubmit.</p>', NULL, 'Go to Dashboard', '{{dashboard_link}}')),
('Platform Announcement', '{{subject}}', public.create_base_email('{{subject}}', '{{preheader}}', '{{content}}', NULL, '{{cta_text}}', '{{cta_link}}'));

-- Clean up the helper function
DROP FUNCTION public.create_base_email(text, text, text, text, text, text);