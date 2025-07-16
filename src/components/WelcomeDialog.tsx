import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PartyPopper } from 'lucide-react';

interface WelcomeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string | null;
}

const WelcomeDialog = ({ isOpen, onClose, userName }: WelcomeDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <PartyPopper className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="mt-4 text-2xl">Welcome, {userName || 'Filmmaker'}!</DialogTitle>
          <DialogDescription className="mt-2">
            Your account has been approved. We're thrilled to have you join our community of storytellers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button onClick={onClose}>Let's Go!</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeDialog;