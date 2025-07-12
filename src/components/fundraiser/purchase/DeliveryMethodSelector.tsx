
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
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
  onPickupAvailabilityChange?: (isAvailable: boolean) => void;
}

export const DeliveryMethodSelector = ({
  deliveryMethod,
  onDeliveryMethodChange,
  fundraiserId,
  ageDivision,
  teamName,
  onTeamSelectionChange,
  onPickupAvailabilityChange,
}: DeliveryMethodSelectorProps) => {
  // Check if pickup is available for this fundraiser
  const { data: ageDivisions, isLoading } = useQuery({
    queryKey: ['fundraiser-age-divisions', fundraiserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fundraiser_age_divisions')
        .select('*')
        .eq('fundraiser_id', fundraiserId)
        .order('display_order');

      if (error) {
        console.error('Error fetching age divisions:', error);
        throw error;
      }
      return data;
    },
    enabled: !!fundraiserId
  });

  const isPickupAvailable = !isLoading && ageDivisions && ageDivisions.length > 0;

  // Notify parent component about pickup availability
  React.useEffect(() => {
    onPickupAvailabilityChange?.(isPickupAvailable);
  }, [isPickupAvailable, onPickupAvailabilityChange]);

  // If pickup was selected but is no longer available, switch to shipping
  React.useEffect(() => {
    if (deliveryMethod === 'pickup' && !isPickupAvailable && !isLoading) {
      onDeliveryMethodChange('shipping');
    }
  }, [deliveryMethod, isPickupAvailable, isLoading, onDeliveryMethodChange]);

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
            {isPickupAvailable && (
              <SelectItem value="pickup">Pickup from my team</SelectItem>
            )}
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
