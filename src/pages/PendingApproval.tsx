import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hourglass } from 'lucide-react';
import { useSession } from '@/components/SessionContextProvider';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

const PendingApproval = () => {
  const { profile } = useSession();

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
          <Hourglass className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="mt-4 text-2xl font-bold">Thank you for verifying your email!</CardTitle>
          <CardDescription>
            Your account is now awaiting admin approval, {profile?.first_name}. You’ll receive an email once it has been reviewed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">You will be redirected automatically upon approval.</p>
          <Button variant="outline" onClick={handleLogout}>
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingApproval;