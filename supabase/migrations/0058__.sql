INSERT INTO public.email_templates (name, subject, body, is_enabled)
VALUES (
    'Account Verification',
    'Confirm your UniShorts Account | قم بتأكيد حسابك في UniShorts',
    '<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="utf-8">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
    <title>Confirm Your Account</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" media="screen">
    <style>
        body {
            font-family: "Inter", sans-serif;
        }
        .hover-underline:hover {
            text-decoration: underline !important;
        }
        @media (max-width: 600px) {
            .sm-w-full {
                width: 100% !important;
            }
            .sm-px-24 {
                padding-left: 24px !important;
                padding-right: 24px !important;
            }
            .sm-py-32 {
                padding-top: 32px !important;
                padding-bottom: 32px !important;
            }
        }
    </style>
</head>
<body style="margin: 0; width: 100%; padding: 0; word-break: break-word; -webkit-font-smoothing: antialiased; background-color: #f3f4f6;">
    <div style="display: none;">Please confirm your email address to get started.</div>
    <div role="article" aria-roledescription="email" aria-label="Confirm Your Account" lang="en">
        <table style="width: 100%; font-family: ''Inter'', sans-serif;" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
                <td align="center" style="background-color: #f3f4f6;">
                    <table class="sm-w-full" style="width: 600px;" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                            <td class="sm-py-32 sm-px-24" style="padding: 48px; text-align: center;">
                                <a href="https://reqylowdlhhdgoetcfdg.supabase.co">
                                    <h1 style="font-weight: 700; font-size: 24px; color: #1f2937;">UniShorts</h1>
                                </a>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" class="sm-px-24">
                                <table style="width: 100%;" cellpadding="0" cellspacing="0" role="presentation">
                                    <tr>
                                        <td class="sm-px-24" style="background-color: #ffffff; border-radius: 4px; padding: 48px; text-align: left;">
                                            <div style="direction: rtl; text-align: right;">
                                                <p style="margin: 0 0 16px; font-weight: 700; font-size: 20px; color: #000000;">أهلاً بك، {{user_name}}!</p>
                                                <p style="margin: 0 0 24px; font-size: 16px; color: #4b5563;">
                                                    شكراً لتسجيلك. خطوة واحدة فقط تفصلك عن الانضمام لمجتمعنا. يرجى تأكيد بريدك الإلكتروني بالضغط على الزر أدناه.
                                                </p>
                                            </div>
                                            <div style="direction: ltr; text-align: left; border-top: 1px solid #e5e7eb; margin-top: 24px; padding-top: 24px;">
                                                <p style="margin: 0 0 16px; font-weight: 700; font-size: 20px; color: #000000;">Welcome, {{user_name}}!</p>
                                                <p style="margin: 0 0 24px; font-size: 16px; color: #4b5563;">
                                                    Thanks for signing up. Just one more step: please confirm your email address by clicking the button below.
                                                </p>
                                            </div>
                                            <a href="{{verification_link}}" style="display: block; width: 100%; background-color: #2563eb; border-radius: 4px; padding: 16px 24px; font-weight: 700; font-size: 16px; color: #ffffff; text-decoration: none; text-align: center;">Confirm Email Address</a>
                                            <table style="width: 100%;" cellpadding="0" cellspacing="0" role="presentation">
                                                <tr>
                                                    <td style="padding-top: 32px; padding-bottom: 32px;">
                                                        <div style="height: 1px; background-color: #e5e7eb; line-height: 1px;">&zwnj;</div>
                                                    </td>
                                                </tr>
                                            </table>
                                            <p style="margin: 0 0 16px; font-size: 14px; color: #4b5563;">
                                                If the button above doesn''t work, copy and paste this link into your browser:
                                                <br>
                                                <a href="{{verification_link}}" class="hover-underline" style="font-size: 12px; color: #2563eb; text-decoration: none;">{{verification_link}}</a>
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="height: 48px;"></td>
                                    </tr>
                                    <tr>
                                        <td style="padding-left: 24px; padding-right: 24px; text-align: center; font-size: 12px; color: #6b7280;">
                                            <p style="margin: 0 0 16px; text-transform: uppercase;">Powered by UniShorts</p>
                                            <p style="margin: 0; font-style: italic;">The stage for the next generation of storytellers.</p>
                                            <p style="cursor: default;">
                                                <a href="#" class="hover-underline" style="color: #6b7280; text-decoration: none;">Home</a> &bull;
                                                <a href="#" class="hover-underline" style="color: #6b7280; text-decoration: none;">Contact</a>
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>',
    true
)
ON CONFLICT (name) DO UPDATE
SET subject = EXCLUDED.subject,
    body = EXCLUDED.body,
    is_enabled = EXCLUDED.is_enabled,
    updated_at = now();