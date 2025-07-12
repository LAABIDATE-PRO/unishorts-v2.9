import React, { useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Login = () => {
  const [view, setView] = useState<'sign_in' | 'forgotten_password'>('sign_in');

  const handleViewChange = (newView: 'sign_in' | 'forgotten_password') => {
    setView(newView);
  };

  const cardTitle = view === 'sign_in' ? 'Welcome Back!' : 'Reset Password';
  const cardDescription = view === 'sign_in' 
    ? 'Sign in to continue to UniShorts.' 
    : 'Enter your email to receive a password reset link.';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Film className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-3xl font-bold mt-2">
            {cardTitle}
          </CardTitle>
          <CardDescription>
            {cardDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            providers={[]}
            view={view}
            showLinks={false}
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
                  button_label: 'Sign in',
                },
                forgotten_password: {
                  email_label: 'Email address',
                  email_input_placeholder: 'your@email.com',
                  button_label: 'Send reset instructions',
                  confirmation_text: 'A password reset link has been sent to your email address.',
                },
              },
            }}
          />
          <div className="mt-4 text-center text-sm">
            {view === 'sign_in' ? (
              <Button variant="link" onClick={() => handleViewChange('forgotten_password')} className="p-0 h-auto">
                Forgot your password?
              </Button>
            ) : (
              <Button variant="link" onClick={() => handleViewChange('sign_in')} className="p-0 h-auto">
                Back to Sign In
              </Button>
            )}
          </div>
          <div className="relative mt-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Don't have an account?{' '}
            <Button variant="link" asChild className="p-0 h-auto font-semibold text-primary">
              <Link to="/register">Sign up</Link>
            </Button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;