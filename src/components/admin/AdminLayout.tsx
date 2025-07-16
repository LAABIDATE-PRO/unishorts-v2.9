import { NavLink, Outlet, Link } from 'react-router-dom';
import { Home, LogOut, Settings, FileText, SlidersHorizontal, Repeat, BarChart2, Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { useSession } from '../SessionContextProvider';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import BackButton from '../BackButton';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const AdminLayout = () => {
  const { profile } = useSession();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error && error.message !== 'Auth session missing!') {
      showError('Failed to sign out.');
    } else {
      showSuccess('Signed out successfully.');
    }
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
      isActive ? 'bg-muted text-primary' : 'text-muted-foreground'
    }`;
  
  const navContent = (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      <NavLink to="/admin" end className={navLinkClasses}>
        <Home className="h-4 w-4" />
        Dashboard
      </NavLink>
      <NavLink to="/admin/management" className={navLinkClasses}>
        <SlidersHorizontal className="h-4 w-4" />
        Management
      </NavLink>
      <NavLink to="/admin/analytics" className={navLinkClasses}>
        <BarChart2 className="h-4 w-4" />
        Analytics
      </NavLink>
      {profile?.role === 'admin' && (
        <>
          <NavLink to="/admin/settings" className={navLinkClasses}>
            <Settings className="h-4 w-4" />
            Settings
          </NavLink>
          <NavLink to="/admin/logs" className={navLinkClasses}>
            <FileText className="h-4 w-4" />
            System Logs
          </NavLink>
        </>
      )}
    </nav>
  );

  const userActions = (
    <>
      <div className="text-sm p-2">
        <p className="font-semibold">{profile?.first_name} {profile?.last_name}</p>
        <p className="text-xs text-muted-foreground capitalize">{profile?.role}</p>
      </div>
      <Button asChild variant="ghost" className="w-full justify-start">
        <Link to="/">
          <Repeat className="mr-2 h-4 w-4" />
          Switch to User View
        </Link>
      </Button>
      <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link to="/admin" className="flex items-center gap-2 font-semibold text-primary">
              <img src="/logo-icon.svg" alt="UniShorts Icon" className="h-6 w-auto" />
              <span>UniShorts Admin</span>
            </Link>
          </div>
          <div className="flex-1">
            {navContent}
          </div>
          <div className="mt-auto p-4">
            {userActions}
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <div className="flex h-14 items-center border-b px-4">
                <Link to="/admin" className="flex items-center gap-2 font-semibold text-primary">
                  <img src="/logo-icon.svg" alt="UniShorts Icon" className="h-6 w-auto" />
                  <span>UniShorts Admin</span>
                </Link>
              </div>
              <div className="flex-1 py-4 overflow-y-auto">
                {navContent}
              </div>
              <div className="mt-auto p-4 border-t">
                {userActions}
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
             <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          <BackButton />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;