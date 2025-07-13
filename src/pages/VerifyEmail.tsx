import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MailCheck } from 'lucide-react';
import { useSession } from '@/components/SessionContextProvider';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

const VerifyEmail = () => {
  const { user } = useSession();

  const handleResend = async () => {
    if (!user?.email) {
      showError('No email address found for your account.');
      return;
    }
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
    });
    if (error) {
      showError(`Failed to resend verification email: ${error.message}`);
    } else {
      showSuccess('Verification email sent successfully.');
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error && error.message !== 'Auth session missing!') {
      showError('Failed to log out.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <MailCheck className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="mt-4 text-2xl font-bold">Check Your Inbox</CardTitle>
          <CardDescription>
            We've sent a verification link to <strong>{user?.email}</strong>. Please click the link in the email to continue the registration process.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Didn't receive an email? Check your spam folder or click below to resend.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleLogout} className="w-full">
              Log Out
            </Button>
            <Button onClick={handleResend} className="w-full">
              Resend Email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;