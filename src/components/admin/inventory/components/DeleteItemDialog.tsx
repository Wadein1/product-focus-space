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
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface DeleteItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  isLocked?: boolean;
  adminUsername?: string;
  adminPassword?: string;
}

export const DeleteItemDialog = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  isLocked = false,
  adminUsername,
  adminPassword,
}: DeleteItemDialogProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleConfirm = () => {
    if (isLocked) {
      if (username === adminUsername && password === adminPassword) {
        onConfirm();
        onClose();
      } else {
        toast({
          variant: "destructive",
          title: "Authentication failed",
          description: "Invalid admin credentials",
        });
      }
    } else {
      onConfirm();
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {itemName}</AlertDialogTitle>
          <AlertDialogDescription>
            {isLocked ? (
              <>
                <p className="mb-4 text-red-600">
                  Warning: This is a locked item. Admin authentication required.
                </p>
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Admin Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder="Admin Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </>
            ) : (
              "Are you sure you want to delete this item? This action cannot be undone."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};