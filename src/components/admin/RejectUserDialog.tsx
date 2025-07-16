import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AdminUser } from '@/types';

interface RejectUserDialogProps {
  user: AdminUser;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const RejectUserDialog = ({ user, onClose, onConfirm }: RejectUserDialogProps) => {
  const [reason, setReason] = useState('');

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reject User: {user.first_name} {user.last_name}</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting this user. This may be sent to the user.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reason" className="text-right">
              Reason
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Incomplete profile, not a student..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={() => onConfirm(reason)} disabled={!reason}>Confirm Rejection</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RejectUserDialog;