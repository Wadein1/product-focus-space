import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash, GripVertical } from "lucide-react";
import { QuantityControls } from './QuantityControls';

interface VariationRowProps {
  variation: {
    id: string;
    name: string;
    quantity: number;
  };
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: { name?: string; quantity?: number }) => void;
  dragHandleProps?: any;
}

export const VariationRow = ({ 
  variation, 
  onDelete, 
  onUpdate,
  dragHandleProps 
}: VariationRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(variation.name);

  const handleNameSubmit = () => {
    if (name.trim() !== variation.name) {
      onUpdate(variation.id, { name: name.trim() });
    }
    setIsEditing(false);
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

      <QuantityControls
        quantity={variation.quantity}
        onChange={(newQuantity) => 
          onUpdate(variation.id, { quantity: newQuantity })
        }
      />

      <Button
        variant="destructive"
        size="sm"
        onClick={() => onDelete(variation.id)}
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
};