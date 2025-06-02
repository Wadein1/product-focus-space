
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeamPickupSelector } from "../TeamPickupSelector";

interface DeliveryMethodSelectorProps {
  deliveryMethod: 'shipping' | 'pickup';
  onDeliveryMethodChange: (method: 'shipping' | 'pickup') => void;
  fundraiserId: string;
  ageDivision: string;
  teamName: string;
  onTeamSelectionChange: (ageDivision: string, teamName: string) => void;
}

export const DeliveryMethodSelector = ({
  deliveryMethod,
  onDeliveryMethodChange,
  fundraiserId,
  ageDivision,
  teamName,
  onTeamSelectionChange,
}: DeliveryMethodSelectorProps) => {
  const handleDeliveryMethodChange = (value: string) => {
    onDeliveryMethodChange(value as 'shipping' | 'pickup');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <Label className="text-lg font-medium">Delivery Method</Label>
        <Select value={deliveryMethod} onValueChange={handleDeliveryMethodChange}>
          <SelectTrigger className="w-full h-12 text-base">
            <SelectValue placeholder="Select delivery method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="shipping">Ship to me (+$5.00)</SelectItem>
            <SelectItem value="pickup">Pickup from my team</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {deliveryMethod === 'pickup' && (
        <TeamPickupSelector
          fundraiserId={fundraiserId}
          onSelectionChange={onTeamSelectionChange}
          selectedAgeDivision={ageDivision}
          selectedTeam={teamName}
        />
      )}
    </div>
  );
};
