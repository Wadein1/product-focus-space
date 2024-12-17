import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ParLevelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (parLevel: number) => void;
  currentParLevel: number;
  itemName: string;
}

export const ParLevelDialog = ({
  isOpen,
  onClose,
  onConfirm,
  currentParLevel,
  itemName,
}: ParLevelDialogProps) => {
  const [parLevel, setParLevel] = useState(currentParLevel);

  const handleConfirm = () => {
    onConfirm(parLevel);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Par Level for {itemName}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            type="number"
            value={parLevel}
            onChange={(e) => setParLevel(parseInt(e.target.value) || 0)}
            min={0}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};