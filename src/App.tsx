import { Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Settings from '@/pages/Settings';
import Dashboard from '@/pages/Dashboard';
import UploadFilm from '@/pages/UploadFilm';
import EditFilm from '@/pages/EditFilm';
import Explore from '@/pages/Explore';
import Favorites from '@/pages/Favorites';
import Profile from '@/pages/Profile';
import FilmPage from '@/pages/FilmPage';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import Notifications from '@/pages/Notifications';
import PendingApproval from '@/pages/PendingApproval';
import Rejected from '@/pages/Rejected';
import ForgotPassword from '@/pages/ForgotPassword';
import UpdatePassword from '@/pages/UpdatePassword';
import ContactSupport from '@/pages/ContactSupport';
import SuggestFeature from '@/pages/SuggestFeature';

import AdminLayout from '@/components/admin/AdminLayout';
import AdminRoute from '@/components/admin/AdminRoute';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminManagement from '@/pages/admin/Management';
import AdminSettings from '@/pages/admin/Settings';
import AdminLogs from '@/pages/admin/Logs';
import AdminAnalytics from '@/pages/admin/Analytics';

import AdminChoiceDialog from '@/components/AdminChoiceDialog';
import { useAdBlockDetector } from './hooks/useAdBlockDetector';
import AdBlockerDialog from './components/AdBlockerDialog';
import { useSession } from './components/SessionContextProvider';
import WelcomeDialog from './components/WelcomeDialog';

function AuthStateRouter() {
  const { session, isLoading } = useSession();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;

    const hash = location.hash;
    if (hash.includes('type=recovery')) {
      const searchParams = new URLSearchParams(hash.substring(1));
      const accessToken = searchParams.get('access_token');
      if (accessToken) {
        // The user is in the password recovery flow.
        // The UpdatePassword page will handle the token.
        return;
      }
    }
  }, [isLoading, location, session]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/update-password" element={<UpdatePassword />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/upload" element={<UploadFilm />} />
      <Route path="/film/:id/edit" element={<EditFilm />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/u/:username" element={<Profile />} />
      <Route path="/film/:id" element={<FilmPage />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/pending-approval" element={<PendingApproval />} />
      <Route path="/rejected" element={<Rejected />} />
      <Route path="/contact-support" element={<ContactSupport />} />
      <Route path="/suggest-feature" element={<SuggestFeature />} />
      
      <Route path="/admin" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="management" element={<AdminManagement />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="logs" element={<AdminLogs />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  const isAdBlockerDetected = useAdBlockDetector();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { showWelcomePopup, markWelcomePopupAsShown, profile } = useSession();

  useEffect(() => {
    if (isAdBlockerDetected) {
      if (!sessionStorage.getItem('adBlockerDialogShown')) {
        setIsDialogOpen(true);
        sessionStorage.setItem('adBlockerDialogShown', 'true');
      }
    }
  }, [isAdBlockerDetected]);

  return (
    <>
      <AuthStateRouter />
      <AdminChoiceDialog />
      <AdBlockerDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
      {profile && (
        <WelcomeDialog
          isOpen={showWelcomePopup}
          onClose={markWelcomePopupAsShown}
          userName={`${profile.first_name} ${profile.last_name}`}
        />
      )}
    </>
  );
}

export default App;