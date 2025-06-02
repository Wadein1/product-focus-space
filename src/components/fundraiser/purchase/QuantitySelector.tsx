
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (increment: boolean) => void;
}

export const QuantitySelector = ({ quantity, onQuantityChange }: QuantitySelectorProps) => {
  return (
    <div className="space-y-3">
      <Label className="text-lg font-medium">Quantity</Label>
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => onQuantityChange(false)}
          disabled={quantity <= 1}
          className="h-12 w-12 p-0 border-2"
        >
          <Minus className="h-5 w-5" />
        </Button>
        <span className="text-xl font-semibold min-w-[60px] text-center bg-white border-2 border-gray-200 py-3 px-4 rounded-lg">
          {quantity}
        </span>
        <Button
          variant="outline"
          size="lg"
          onClick={() => onQuantityChange(true)}
          className="h-12 w-12 p-0 border-2"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
