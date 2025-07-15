import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { Profile } from '@/types';

interface SessionContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  showAdminChoice: boolean;
  setShowAdminChoice: (show: boolean) => void;
  showWelcomePopup: boolean;
  markWelcomePopupAsShown: () => void;
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

const publicOnlyRoutes = ['/login', '/register', '/forgot-password'];
const specialAccessRoutes = ['/pending-approval', '/rejected', '/update-password'];

export const SessionContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdminChoice, setShowAdminChoice] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const markWelcomePopupAsShown = async () => {
    if (profile?.id) {
      await supabase
        .from('profiles')
        .update({ welcome_popup_shown: true })
        .eq('id', profile.id);
      setProfile(p => p ? { ...p, welcome_popup_shown: true } : null);
    }
    setShowWelcomePopup(false);
  };

  useEffect(() => {
    const setupSessionListener = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      setUser(initialSession?.user ?? null);

      if (initialSession?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', initialSession.user.id)
          .single();
        setProfile(profileData || null);
      }
      setIsLoading(false);

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
          setProfile(profileData || null);
        } else {
          setProfile(null);
        }

        if (event === 'SIGNED_IN') {
          showSuccess('Successfully logged in!');
        }
        
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setShowAdminChoice(false);
          navigate('/login');
        }
        
        if (event === 'PASSWORD_RECOVERY') {
          navigate('/update-password');
        }
      });

      return () => subscription?.unsubscribe();
    };

    setupSessionListener();
  }, [navigate]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`profiles:${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
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
    if (isLoading) return;

    const currentPath = location.pathname;

    if (!session) {
      if (isProtectedRoute(currentPath)) {
        navigate(`/login?redirectTo=${currentPath}`, { replace: true });
      }
      return;
    }

    // User is logged in
    if (profile) {
      if (profile.account_status === 'active' && profile.welcome_popup_shown === false) {
        setShowWelcomePopup(true);
      }

      const status = profile.account_status;
      const redirectTo = new URLSearchParams(location.search).get('redirectTo');

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
    }
  }, [session, user, profile, isLoading, location, navigate]);

  return (
    <SessionContext.Provider value={{ session, user, profile, isLoading, showAdminChoice, setShowAdminChoice, showWelcomePopup, markWelcomePopupAsShown }}>
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