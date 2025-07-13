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
const specialAccessRoutes = ['/pending-approval', '/rejected', '/verify-email'];

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
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (event === 'SIGNED_IN') {
        showSuccess('Successfully logged in!');
      }
      
      if (event === 'SIGNED_OUT') {
        setProfile(null);
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
      setIsLoading(true);
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => {
          setProfile(data || null);
          setIsLoading(false);
        });
    } else {
      setProfile(null);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`profile-changes:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          setProfile(payload.new as Profile);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const currentPath = location.pathname;

    if (!session) {
      if (isProtectedRoute(currentPath)) {
        navigate(`/login?redirectTo=${currentPath}`, { replace: true });
      }
      return;
    }

    if (profile) {
      const status = profile.account_status;
      const params = new URLSearchParams(location.search);
      const redirectTo = params.get('redirectTo');

      if (status === 'pending_email_verification' && currentPath !== '/verify-email') {
        navigate('/verify-email', { replace: true });
        return;
      }

      if (status === 'pending_admin_approval' && currentPath !== '/pending-approval') {
        navigate('/pending-approval', { replace: true });
        return;
      }

      if ((status === 'rejected' || status === 'disabled') && currentPath !== '/rejected') {
        navigate('/rejected', { replace: true });
        return;
      }

      if (status === 'active') {
        if (specialAccessRoutes.includes(currentPath)) {
          navigate('/', { replace: true });
          return;
        }
        if (publicOnlyRoutes.includes(currentPath)) {
          if (profile.role === 'admin' || profile.role === 'moderator') {
            setShowAdminChoice(true);
          }
          navigate(redirectTo || '/', { replace: true });
        }
      }
    } else if (user && !isLoading) {
        if (currentPath !== '/verify-email') {
            navigate('/verify-email', { replace: true });
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