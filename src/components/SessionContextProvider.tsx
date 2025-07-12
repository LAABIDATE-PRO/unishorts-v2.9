import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess } from '@/utils/toast';
import { Profile } from '@/types';

interface SessionContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  showAdminChoice: boolean;
  setShowAdminChoice: (show: boolean) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const protectedRoutes = [
  '/settings',
  '/dashboard',
  '/upload',
  '/favorites',
  '/admin',
];

const isProtectedRoute = (pathname: string) => {
  if (pathname.match(/^\/film\/[^/]+\/edit$/)) {
    return true;
  }
  return protectedRoutes.some(route => pathname.startsWith(route));
};

const publicOnlyRoutes = ['/login', '/register'];
const specialAccessRoutes = ['/pending-approval', '/rejected'];

export const SessionContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdminChoice, setShowAdminChoice] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);

      if (event === 'SIGNED_IN') {
        showSuccess('Successfully logged in!');
      }
      
      if (event === 'SIGNED_OUT') {
        setShowAdminChoice(false);
        navigate('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => {
          setProfile(data || null);
        });
    } else {
      setProfile(null);
    }
  }, [user]);

  useEffect(() => {
    if (isLoading) {
      return; // Wait until session and profile loading is complete
    }

    const currentPath = location.pathname;

    // If no session, redirect protected routes to login
    if (!session) {
      if (isProtectedRoute(currentPath)) {
        navigate(`/login?redirectTo=${currentPath}`, { replace: true });
      }
      return;
    }

    // If session exists, but profile is not loaded yet, wait.
    if (!profile) {
      return;
    }

    // --- Main Logic: User is logged in and profile is loaded ---
    const status = profile.account_status;
    const params = new URLSearchParams(location.search);
    const redirectTo = params.get('redirectTo');

    if (status === 'pending' && currentPath !== '/pending-approval') {
      navigate('/pending-approval', { replace: true });
      return;
    }

    if ((status === 'rejected' || status === 'disabled') && currentPath !== '/rejected') {
      navigate('/rejected', { replace: true });
      return;
    }

    if (status === 'active') {
      // If user is active but on a special page, redirect them away
      if (specialAccessRoutes.includes(currentPath)) {
        navigate('/', { replace: true });
        return;
      }
      // If user is on a public-only page (login/register), redirect them
      if (publicOnlyRoutes.includes(currentPath)) {
        if (profile.role === 'admin' || profile.role === 'moderator') {
          setShowAdminChoice(true);
        }
        navigate(redirectTo || '/', { replace: true });
      }
    }
  }, [session, profile, isLoading, location, navigate]);

  return (
    <SessionContext.Provider value={{ session, user, profile, isLoading, showAdminChoice, setShowAdminChoice }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
};