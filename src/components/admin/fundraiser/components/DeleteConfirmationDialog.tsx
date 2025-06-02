
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Fundraiser } from '../types';

interface DeleteConfirmationDialogProps {
  fundraiser: Fundraiser | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  fundraiser,
  isDeleting,
  onConfirm,
  onCancel
}) => {
  return (
    <AlertDialog open={!!fundraiser} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Fundraiser</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{fundraiser?.title}"? This action cannot be undone and will remove:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>The fundraiser and all its variations</li>
              <li>All associated images</li>
              <li>All order history and transaction records</li>
              <li>All donation tracking data</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete Fundraiser"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
