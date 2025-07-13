import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

const Rejected = () => {
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
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <CardTitle className="mt-4 text-2xl font-bold">Account Not Approved</CardTitle>
          <CardDescription>
            Unfortunately, your registration to UniShorts was not approved at this time. If you believe this is a mistake, please contact support.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleLogout}>
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Rejected;