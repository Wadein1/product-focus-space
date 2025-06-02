
import React from 'react';
import { DeliveryMethodSelector } from './purchase/DeliveryMethodSelector';
import { QuantitySelector } from './purchase/QuantitySelector';
import { PricingDisplay } from './purchase/PricingDisplay';
import { PurchaseActions } from './purchase/PurchaseActions';

interface FundraiserPurchaseProps {
  price: number;
  quantity: number;
  onQuantityChange: (increment: boolean) => void;
  fundraiserId: string;
  variationId: string;
  productName: string;
  imagePath?: string;
  fundraiserTitle?: string;
  variationTitle?: string;
}

export const FundraiserPurchase = ({
  price,
  quantity,
  onQuantityChange,
  fundraiserId,
  variationId,
  productName,
  imagePath,
  fundraiserTitle,
  variationTitle,
}: FundraiserPurchaseProps) => {
  const [deliveryMethod, setDeliveryMethod] = React.useState<'shipping' | 'pickup'>('shipping');
  const [ageDivision, setAgeDivision] = React.useState<string>('');
  const [teamName, setTeamName] = React.useState<string>('');

  const handleDeliveryMethodChange = (value: 'shipping' | 'pickup') => {
    setDeliveryMethod(value);
    // Reset team selection when switching delivery methods
    if (value === 'shipping') {
      setAgeDivision('');
      setTeamName('');
    }
  };

  const handleTeamSelectionChange = (selectedAgeDivision: string, selectedTeamName: string) => {
    setAgeDivision(selectedAgeDivision);
    setTeamName(selectedTeamName);
  };

  return (
    <div className="space-y-6 bg-gray-50 p-4 rounded-lg">
      <PricingDisplay 
        totalPrice={price * quantity} 
        deliveryMethod={deliveryMethod} 
      />

      <div className="space-y-6">
        <DeliveryMethodSelector
          deliveryMethod={deliveryMethod}
          onDeliveryMethodChange={handleDeliveryMethodChange}
          fundraiserId={fundraiserId}
          ageDivision={ageDivision}
          teamName={teamName}
          onTeamSelectionChange={handleTeamSelectionChange}
        />

        <QuantitySelector
          quantity={quantity}
          onQuantityChange={onQuantityChange}
        />

        <PurchaseActions
          price={price}
          quantity={quantity}
          productName={productName}
          imagePath={imagePath}
          fundraiserId={fundraiserId}
          variationId={variationId}
          deliveryMethod={deliveryMethod}
          ageDivision={ageDivision}
          teamName={teamName}
          fundraiserTitle={fundraiserTitle}
          variationTitle={variationTitle}
        />
      </div>
    </div>
  );
};
