import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-sm mx-auto">
        <div className="grid gap-6">
          <div className="grid gap-2 text-center">
            <Link to="/" className="flex items-center justify-center mb-4">
              <img src="/full-logo.svg" alt="UniShorts Logo" className="h-9" />
            </Link>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;