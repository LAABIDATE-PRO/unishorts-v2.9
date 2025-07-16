INSERT INTO public.email_templates (name, subject, body, is_enabled)
VALUES (
    'Account Verification',
    'Confirm your UniShorts Account | قم بتأكيد حسابك في UniShorts',
    '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Your Account</title>
    <style>
        @import url(https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap);
        body {
            font-family: "Inter", Arial, sans-serif;
        }
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: &quot;Inter&quot;, Arial, sans-serif; background-color: #f4f4f4;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; border-collapse: collapse; margin-top: 20px; background-color: #ffffff; border: 1px solid #dddddd; border-radius: 8px; overflow: hidden;">
        <tr>
            <td align="center" style="padding: 20px 0 20px 0; background-color: #0f172a; color: #ffffff;">
                <h1 style="margin: 0; font-size: 24px; font-weight: bold;">UniShorts</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 30px 20px 30px; direction: rtl; text-align: right;">
                <h2 style="color: #333333; font-weight: bold;">أهلاً بك {{user_name}}،</h2>
                <p style="color: #555555; font-size: 16px; line-height: 1.5;">شكراً لتسجيلك في UniShorts. خطوة واحدة تفصلك عن الانضمام لمجتمعنا! يرجى تأكيد بريدك الإلكتروني بالضغط على الزر أدناه.</p>
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td align="center" style="padding: 20px 0 20px 0;">
                            <a href="{{verification_link}}" style="background-color: #2563eb; color: #ffffff; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block; font-weight: bold;">تأكيد البريد الإلكتروني</a>
                        </td>
                    </tr>
                </table>
                <p style="color: #555555; font-size: 14px; line-height: 1.5;">إذا لم يعمل الزر، يمكنك نسخ ولصق الرابط التالي في متصفحك:</p>
                <p style="color: #2563eb; font-size: 12px; word-break: break-all; text-align: left; direction: ltr;">{{verification_link}}</p>
            </td>
        </tr>
        <tr>
            <td style="padding: 20px 30px 40px 30px; direction: ltr; text-align: left; border-top: 1px solid #eeeeee;">
                <h2 style="color: #333333; font-weight: bold;">Welcome, {{user_name}}!</h2>
                <p style="color: #555555; font-size: 16px; line-height: 1.5;">Thanks for signing up for UniShorts. One step left to join our community! Please confirm your email by clicking the button below.</p>
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td align="center" style="padding: 20px 0 20px 0;">
                            <a href="{{verification_link}}" style="background-color: #2563eb; color: #ffffff; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block; font-weight: bold;">Confirm Email</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding: 20px; background-color: #f4f4f4; color: #888888; font-size: 12px;">
                <p style="margin: 0;">&copy; 2024 UniShorts. All rights reserved.</p>
                <p style="margin: 5px 0 0 0;">You are receiving this email because you signed up for an account.</p>
            </td>
        </tr>
    </table>
</body>
</html>',
    true
)
ON CONFLICT (name) DO UPDATE
SET subject = EXCLUDED.subject,
    body = EXCLUDED.body,
    is_enabled = EXCLUDED.is_enabled,
    updated_at = now();