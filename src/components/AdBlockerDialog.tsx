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
          <AlertDialogTitle className="text-center text-2xl">تم اكتشاف أداة لحظر الإعلانات</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            يبدو أنك تستخدم أداة لحظر الإعلانات. نحن نعتمد على الإعلانات لدعم المنصة وتقديم المحتوى مجانًا.
            <br /><br />
            <strong>الرجاء التفكير في تعطيل مانع الإعلانات الخاص بك على موقعنا.</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose} className="w-full">لقد فهمت</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AdBlockerDialog;