import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";

interface QuantityControlsProps {
  quantity: number;
  onChange: (newQuantity: number) => void;
}

export const QuantityControls = ({ quantity, onChange }: QuantityControlsProps) => {
  const increment = () => onChange(quantity + 1);
  const decrement = () => onChange(Math.max(0, quantity - 1));

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={decrement}
        className="h-8 w-8"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        value={quantity}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-20"
      />
      <Button 
        variant="outline" 
        size="icon" 
        onClick={increment}
        className="h-8 w-8"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};