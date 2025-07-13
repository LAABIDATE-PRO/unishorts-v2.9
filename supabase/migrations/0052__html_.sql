-- Update user_verification template
UPDATE public.email_templates
SET 
  subject = 'Activate Your UniShorts Account',
  body = $$
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Activate Your Account</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td style="padding: 20px 0;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border: 1px solid #dddddd; border-radius: 8px;">
                    <tr>
                        <td align="center" style="padding: 40px 0 30px 0; background-color: #0f172a; color: #ffffff; font-size: 28px; font-weight: bold; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                            UniShorts
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="color: #151515; font-size: 24px; font-weight: bold; padding-bottom: 20px;">
                                        Almost there, {{ .User.UserMetadata.first_name }}!
                                    </td>
                                </tr>
                                <tr>
                                    <td style="color: #555555; font-size: 16px; line-height: 1.5;">
                                        Thanks for signing up for UniShorts! Please click the button below to verify your email address. This is the first step to getting your account approved by our team.
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 30px 0;">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td align="center">
                                                    <a href="{{ .ConfirmationURL }}" target="_blank" style="background-color: #0d6efd; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">Verify Email Address</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="color: #555555; font-size: 14px; line-height: 1.5; text-align: center;">
                                        If the button above doesn't work, copy and paste this link into your browser:<br><a href="{{ .ConfirmationURL }}" style="color: #0d6efd; text-decoration: underline;">{{ .ConfirmationURL }}</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px; background-color: #eeeeee; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="color: #777777; font-size: 12px;">
                                        &copy; 2024 UniShorts. All rights reserved.<br>
                                        If you did not sign up for this account, you can safely ignore this email.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  $$
WHERE name = 'user_verification';

-- Update account_approved template
UPDATE public.email_templates
SET 
  subject = 'Welcome to UniShorts! Your Account is Approved.',
  body = $$
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Approved</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td style="padding: 20px 0;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border: 1px solid #dddddd; border-radius: 8px;">
                    <tr>
                        <td align="center" style="padding: 40px 0 30px 0; background-color: #0f172a; color: #ffffff; font-size: 28px; font-weight: bold; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                            UniShorts
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="color: #151515; font-size: 24px; font-weight: bold; padding-bottom: 20px;">
                                        You're In!
                                    </td>
                                </tr>
                                <tr>
                                    <td style="color: #555555; font-size: 16px; line-height: 1.5;">
                                        Hi {{ .User.UserMetadata.first_name }},<br><br>Great news! Your UniShorts account has been approved. You can now log in to explore films, upload your work, and connect with a community of filmmakers.
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 30px 0;">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td align="center">
                                                    <a href="{{ .SiteURL }}/login" target="_blank" style="background-color: #0d6efd; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">Log In To Your Account</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="color: #555555; font-size: 16px; line-height: 1.5;">
                                        We're excited to see what you create.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px; background-color: #eeeeee; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="color: #777777; font-size: 12px;">
                                        &copy; 2024 UniShorts. All rights reserved.<br>
                                        You're receiving this email because your account on our platform was approved.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  $$
WHERE name = 'account_approved';

-- Update account_rejected template
UPDATE public.email_templates
SET 
  subject = 'An Update on Your UniShorts Account',
  body = $$
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Update</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td style="padding: 20px 0;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border: 1px solid #dddddd; border-radius: 8px;">
                    <tr>
                        <td align="center" style="padding: 40px 0 30px 0; background-color: #0f172a; color: #ffffff; font-size: 28px; font-weight: bold; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                            UniShorts
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="color: #151515; font-size: 24px; font-weight: bold; padding-bottom: 20px;">
                                        Account Application Update
                                    </td>
                                </tr>
                                <tr>
                                    <td style="color: #555555; font-size: 16px; line-height: 1.5;">
                                        Hi {{ .User.UserMetadata.first_name }},<br><br>Thank you for your interest in UniShorts. After a review of your application, we are unable to approve your account at this time.<br><br><strong>Reason provided:</strong> {{ .Reason }}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 30px 0;">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td align="center">
                                                    <a href="{{ .SiteURL }}" target="_blank" style="background-color: #6c757d; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">Visit UniShorts</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px; background-color: #eeeeee; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="color: #777777; font-size: 12px;">
                                        &copy; 2024 UniShorts. All rights reserved.<br>
                                        If you believe this is a mistake or have any questions, please contact our support team.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  $$
WHERE name = 'account_rejected';