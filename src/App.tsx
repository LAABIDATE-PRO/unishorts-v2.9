import { Routes, Route } from 'react-router-dom';
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

import AdminLayout from '@/components/admin/AdminLayout';
import AdminRoute from '@/components/admin/AdminRoute';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminFilms from '@/pages/admin/Films';
import AdminUsers from '@/pages/admin/Users';
import AdminSettings from '@/pages/admin/Settings';
import AdminLogs from '@/pages/admin/Logs';
import AdminEmails from '@/pages/admin/Emails';
import AdminInstitutions from '@/pages/admin/Institutions';
import AdminRoles from '@/pages/admin/Roles';
import AdminChoiceDialog from '@/components/AdminChoiceDialog';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
        
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="films" element={<AdminFilms />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="logs" element={<AdminLogs />} />
            <Route path="emails" element={<AdminEmails />} />
            <Route path="institutions" element={<AdminInstitutions />} />
            <Route path="roles" element={<AdminRoles />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <AdminChoiceDialog />
    </>
  );
}

export default App;