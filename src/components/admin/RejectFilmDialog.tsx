import React, { useState } from 'react';
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
import { Film } from '@/types';

interface RejectFilmDialogProps {
  film: Film;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const RejectFilmDialog: React.FC<RejectFilmDialogProps> = ({ film, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reject Film: {film.title}</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting this film. This will be visible to the creator.
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
              placeholder="e.g., Copyright issues, low video quality..."
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

export default RejectFilmDialog;