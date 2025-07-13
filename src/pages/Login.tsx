import { Auth } from '@supabase/auth-ui-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import AuthLayout from '@/components/AuthLayout';

const Login = () => {
  return (
    <AuthLayout>
      <h1 className="text-3xl font-bold">Welcome Back</h1>
      <p className="text-balance text-muted-foreground">
        Enter your credentials to access your account.
      </p>
      <div className="grid gap-4 text-left">
        <Auth
          supabaseClient={supabase}
          providers={[]}
          view="sign_in"
          showLinks={true}
          appearance={{
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary))',
                  brandButtonText: 'hsl(var(--primary-foreground))',
                  defaultButtonBackground: 'hsl(var(--card))',
                  defaultButtonBackgroundHover: 'hsl(var(--muted))',
                  defaultButtonBorder: 'hsl(var(--border))',
                  defaultButtonText: 'hsl(var(--foreground))',
                  inputBackground: 'hsl(var(--background))',
                  inputBorder: 'hsl(var(--input))',
                  inputBorderHover: 'hsl(var(--ring))',
                  inputBorderFocus: 'hsl(var(--ring))',
                  inputText: 'hsl(var(--foreground))',
                  inputLabelText: 'hsl(var(--foreground))',
                  inputPlaceholder: 'hsl(var(--muted-foreground))',
                  messageText: 'hsl(var(--foreground))',
                  messageTextDanger: 'hsl(var(--destructive))',
                  anchorTextColor: 'hsl(var(--primary))',
                  anchorTextHoverColor: 'hsl(var(--primary))',
                },
                radii: {
                  borderRadiusButton: 'var(--radius)',
                  buttonBorderRadius: 'var(--radius)',
                  inputBorderRadius: 'var(--radius)',
                },
                fonts: {
                  bodyFontFamily: 'inherit',
                  buttonFontFamily: 'inherit',
                  inputFontFamily: 'inherit',
                  labelFontFamily: 'inherit',
                },
              },
            },
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email address',
                password_label: 'Password',
                email_input_placeholder: 'Your email address',
                password_input_placeholder: 'Your password',
                button_label: 'Sign In',
                link_text: 'Forgot your password?',
              },
              forgotten_password: {
                email_label: 'Email address',
                email_input_placeholder: 'your@email.com',
                button_label: 'Send reset instructions',
                link_text: 'Back to Sign In',
                confirmation_text: 'A password reset link has been sent to your email address.',
              },
            },
          }}
        />
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Button variant="link" asChild className="p-0 h-auto font-semibold">
            <Link to="/register">Sign up</Link>
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;