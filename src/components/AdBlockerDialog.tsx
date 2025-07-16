import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ShieldAlert } from 'lucide-react';

interface AdBlockerDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdBlockerDialog = ({ isOpen, onClose }: AdBlockerDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-16 w-16 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center text-2xl">Ad Blocker Detected</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            It looks like you're using an ad blocker. We rely on ads to support the platform and provide content for free.
            <br /><br />
            <strong>Please consider disabling your ad blocker on our site.</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose} className="w-full">I understand</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AdBlockerDialog;