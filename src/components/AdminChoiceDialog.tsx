import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from './SessionContextProvider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, Home } from 'lucide-react';

const AdminChoiceDialog = () => {
  const { showAdminChoice, setShowAdminChoice } = useSession();
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    setShowAdminChoice(false);
    navigate(path);
  };

  return (
    <Dialog open={showAdminChoice} onOpenChange={setShowAdminChoice}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome, Admin!</DialogTitle>
          <DialogDescription>
            Please choose your destination.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-4">
          <Button size="lg" onClick={() => handleNavigate('/admin')}>
            <Shield className="mr-2 h-5 w-5" />
            Go to Admin Dashboard
          </Button>
          <Button size="lg" variant="outline" onClick={() => handleNavigate('/')}>
            <Home className="mr-2 h-5 w-5" />
            Go to Homepage
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminChoiceDialog;