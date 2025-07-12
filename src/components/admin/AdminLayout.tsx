import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Film, Users, LogOut, Shield, Settings, FileText, Mail, Building2, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { useSession } from '../SessionContextProvider';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

const AdminLayout: React.FC = () => {
  const { profile } = useSession();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError('Failed to sign out.');
    } else {
      showSuccess('Signed out successfully.');
    }
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
      isActive ? 'bg-muted text-primary' : 'text-muted-foreground'
    }`;

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <NavLink to="/admin" className="flex items-center gap-2 font-semibold text-primary">
              <Shield className="h-6 w-6" />
              <span>UniShorts Admin</span>
            </NavLink>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <NavLink to="/admin" end className={navLinkClasses}>
                <Home className="h-4 w-4" />
                Dashboard
              </NavLink>
              <NavLink to="/admin/films" className={navLinkClasses}>
                <Film className="h-4 w-4" />
                Films
              </NavLink>
              {profile?.role === 'admin' && (
                <>
                  <NavLink to="/admin/users" className={navLinkClasses}>
                    <Users className="h-4 w-4" />
                    Users
                  </NavLink>
                  <NavLink to="/admin/institutions" className={navLinkClasses}>
                    <Building2 className="h-4 w-4" />
                    Institutions
                  </NavLink>
                  <NavLink to="/admin/logs" className={navLinkClasses}>
                    <FileText className="h-4 w-4" />
                    System Logs
                  </NavLink>
                  <NavLink to="/admin/emails" className={navLinkClasses}>
                    <Mail className="h-4 w-4" />
                    Email Templates
                  </NavLink>
                  <NavLink to="/admin/roles" className={navLinkClasses}>
                    <ShieldCheck className="h-4 w-4" />
                    Roles & Permissions
                  </NavLink>
                  <NavLink to="/admin/settings" className={navLinkClasses}>
                    <Settings className="h-4 w-4" />
                    Settings
                  </NavLink>
                </>
              )}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <div className="text-sm p-2">
              <p className="font-semibold">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-xs text-muted-foreground capitalize">{profile?.role}</p>
            </div>
            <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;