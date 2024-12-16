import React from 'react';
import { Button } from "@/components/ui/button";

interface FundraiserPurchaseProps {
  basePrice: number;
  quantity: number;
  onQuantityChange: (increment: boolean) => void;
  onBuyNow: () => void;
}

export const FundraiserPurchase = ({
  basePrice,
  quantity,
  onQuantityChange,
  onBuyNow,
}: FundraiserPurchaseProps) => {
  return (
    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
      <div className="border-t border-b py-4">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold">${basePrice}</p>
          <p className="text-sm text-gray-500">(+$8.00 shipping & 5% tax)</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Quantity:</span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuantityChange(false)}
              disabled={quantity <= 1}
            >
              -
            </Button>
            <span className="w-12 text-center">{quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuantityChange(true)}
            >
              +
            </Button>
          </div>
        </div>

        <Button 
          onClick={onBuyNow}
          className="w-full bg-primary text-white hover:bg-primary/90"
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
};