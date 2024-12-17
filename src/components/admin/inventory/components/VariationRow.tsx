import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash, GripVertical } from "lucide-react";
import { QuantityControls } from './QuantityControls';
import { ParLevelDialog } from './ParLevelDialog';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { ColorPicker } from './ColorPicker';

interface VariationRowProps {
  variation: {
    id: string;
    name: string;
    quantity: number;
    par_level: number;
    order_index: number;
    color?: string | null;
  };
  showColorPicker?: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: { 
    name?: string; 
    quantity?: number; 
    par_level?: number; 
    order_index?: number;
    color?: string | null;
  }) => void;
  dragHandleProps?: any;
}

export const VariationRow = ({ 
  variation, 
  showColorPicker = false,
  onDelete, 
  onUpdate,
  dragHandleProps 
}: VariationRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(variation.name);
  const [isParLevelDialogOpen, setIsParLevelDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleNameSubmit = () => {
    if (name.trim() !== variation.name) {
      onUpdate(variation.id, { name: name.trim() });
    }
    setIsEditing(false);
  };

  const handleParLevelUpdate = (newParLevel: number) => {
    onUpdate(variation.id, { par_level: newParLevel });
  };

  return (
    <div className="flex items-center gap-4 p-2 bg-white">
      <div {...dragHandleProps} className="cursor-grab">
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>
      
      {isEditing ? (
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleNameSubmit}
          onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
          autoFocus
        />
      ) : (
        <div 
          onClick={() => setIsEditing(true)}
          className="flex-1 cursor-pointer hover:bg-gray-50 p-2 rounded"
        >
          {variation.name}
        </div>
      )}

      {showColorPicker && (
        <ColorPicker
          color={variation.color || null}
          onChange={(color) => onUpdate(variation.id, { color })}
        />
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsParLevelDialogOpen(true)}
        >
          Par: {variation.par_level}
        </Button>

        <QuantityControls
          quantity={variation.quantity}
          onChange={(newQuantity) => 
            onUpdate(variation.id, { quantity: newQuantity })
          }
        />

        <Button
          variant="destructive"
          size="sm"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>

      <ParLevelDialog
        isOpen={isParLevelDialogOpen}
        onClose={() => setIsParLevelDialogOpen(false)}
        onConfirm={handleParLevelUpdate}
        currentParLevel={variation.par_level}
        itemName={variation.name}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => onDelete(variation.id)}
        title="Delete Variation"
        description={`Are you sure you want to delete ${variation.name}? This action cannot be undone.`}
      />
    </div>
  );
};
