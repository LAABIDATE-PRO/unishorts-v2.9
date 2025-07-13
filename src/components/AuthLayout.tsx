import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-sm mx-auto">
        <div className="grid gap-6">
          <div className="grid gap-2 text-center">
            <Link to="/" className="flex items-center justify-center space-x-2 mb-4">
              <Film className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">UniShorts</span>
            </Link>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;