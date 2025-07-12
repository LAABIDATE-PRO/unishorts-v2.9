import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface LoginPromptProps {
  message: string;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ message }) => {
  const location = useLocation();

  return (
    <div className="flex items-center justify-center py-16">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <Lock className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="mt-4 text-2xl font-bold">Login Required</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg" className="w-full">
            <Link to={`/login?redirectTo=${location.pathname}`}>
              Log In / Create Account
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPrompt;