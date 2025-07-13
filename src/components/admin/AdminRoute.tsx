import { useSession } from '@/components/SessionContextProvider';
import { Navigate, Outlet } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const AdminRoute = () => {
  const { profile, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Skeleton className="h-20 w-full max-w-md" />
      </div>
    );
  }

  if (profile?.role !== 'admin' && profile?.role !== 'moderator') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;