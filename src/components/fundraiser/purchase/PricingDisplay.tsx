
import React from 'react';

interface PricingDisplayProps {
  totalPrice: number;
  deliveryMethod: 'shipping' | 'pickup';
}

export const PricingDisplay = ({ totalPrice, deliveryMethod }: PricingDisplayProps) => {
  return (
    <div className="border-t border-b py-4">
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold">${totalPrice.toFixed(2)}</p>
        {deliveryMethod === "shipping" && (
          <p className="text-sm text-gray-500">(+$5.00 shipping)</p>
        )}
      </div>
    </div>
  );
};
