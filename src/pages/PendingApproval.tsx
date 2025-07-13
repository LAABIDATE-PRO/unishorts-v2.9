import React from 'react';
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
          <Hourglass className="mx-auto h-12 w-12 text-primary animate-spin" />
          <CardTitle className="mt-4 text-2xl font-bold">Your account is under review.</CardTitle>
          <CardDescription>
            Thank you for signing up to UniShorts, {profile?.first_name}. Your account is currently pending approval by our moderation team. You’ll receive an email once it has been reviewed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">This usually takes up to 24 hours.</p>
          <Button variant="outline" onClick={handleLogout}>
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingApproval;