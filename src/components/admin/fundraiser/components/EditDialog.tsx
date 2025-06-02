
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FundraiserForm } from '../FundraiserForm';
import type { Fundraiser } from '../types';

interface EditDialogProps {
  fundraiser: Fundraiser | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditDialog: React.FC<EditDialogProps> = ({
  fundraiser,
  onClose,
  onSuccess
}) => {
  return (
    <Dialog open={!!fundraiser} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Fundraiser</DialogTitle>
        </DialogHeader>
        {fundraiser && (
          <FundraiserForm 
            fundraiser={fundraiser}
            onSuccess={() => {
              onClose();
              onSuccess();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
