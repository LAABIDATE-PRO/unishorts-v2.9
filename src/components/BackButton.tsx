import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Do not show on homepage or the root of the admin dashboard
  if (location.pathname === '/' || location.pathname === '/admin') {
    return null;
  }

  const handleBack = () => {
    // If there's history, go back. Otherwise, go to home.
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <Button variant="ghost" onClick={handleBack} className="mb-4">
      <ArrowLeft className="mr-2 h-4 w-4" />
      Back
    </Button>
  );
};

export default BackButton;