
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
  schoolMode?: boolean;
  bigSchool?: boolean;
  teacherList?: string[];
}

export const DeliveryMethodSelector = ({
  deliveryMethod,
  onDeliveryMethodChange,
  fundraiserId,
  ageDivision,
  teamName,
  onTeamSelectionChange,
  onPickupAvailabilityChange,
  schoolMode = false,
  bigSchool = false,
  teacherList = []
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

  // Fetch fundraiser shipping settings and school mode
  const { data: fundraiser } = useQuery({
    queryKey: ['fundraiser-shipping-settings', fundraiserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fundraisers')
        .select('allow_team_shipping, allow_regular_shipping, school_mode, big_school, teacher_list')
        .eq('id', fundraiserId)
        .single();

      if (error) {
        console.error('Error fetching fundraiser shipping settings:', error);
        throw error;
      }
      return data;
    },
    enabled: !!fundraiserId
  });

  const isPickupAvailable = !isLoading && ageDivisions && ageDivisions.length > 0 && (fundraiser?.allow_team_shipping ?? true);
  const isRegularShippingAvailable = fundraiser?.allow_regular_shipping ?? true;
  
  const currentSchoolMode = fundraiser?.school_mode ?? schoolMode;
  const currentBigSchool = fundraiser?.big_school ?? bigSchool;
  const currentTeacherList = (fundraiser?.teacher_list as string[]) ?? teacherList;
  
  const pickupLabel = currentSchoolMode ? "Deliver to my school" : "Pickup from my team";

  // Notify parent component about pickup availability
  React.useEffect(() => {
    onPickupAvailabilityChange?.(isPickupAvailable);
  }, [isPickupAvailable, onPickupAvailabilityChange]);

  // If pickup was selected but is no longer available, switch to shipping
  React.useEffect(() => {
    if (deliveryMethod === 'pickup' && !isPickupAvailable && !isLoading) {
      if (isRegularShippingAvailable) {
        onDeliveryMethodChange('shipping');
      }
    }
  }, [deliveryMethod, isPickupAvailable, isLoading, isRegularShippingAvailable, onDeliveryMethodChange]);

  // If shipping was selected but is no longer available, switch to pickup
  React.useEffect(() => {
    if (deliveryMethod === 'shipping' && !isRegularShippingAvailable) {
      if (isPickupAvailable) {
        onDeliveryMethodChange('pickup');
      }
    }
  }, [deliveryMethod, isRegularShippingAvailable, isPickupAvailable, onDeliveryMethodChange]);

  const handleDeliveryMethodChange = (value: string) => {
    onDeliveryMethodChange(value as 'shipping' | 'pickup');
  };

  // If no delivery options are available
  if (!isRegularShippingAvailable && !isPickupAvailable) {
    return (
      <div className="space-y-4">
        <Label className="text-lg font-medium">Delivery Method</Label>
        <div className="p-4 bg-muted rounded-md text-center text-muted-foreground">
          No delivery options are currently available for this fundraiser.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <Label className="text-lg font-medium">Delivery Method</Label>
        <Select value={deliveryMethod} onValueChange={handleDeliveryMethodChange}>
          <SelectTrigger className="w-full h-12 text-base">
            <SelectValue placeholder="Select delivery method" />
          </SelectTrigger>
          <SelectContent>
            {isRegularShippingAvailable && (
              <SelectItem value="shipping">Ship to me (+$5.00)</SelectItem>
            )}
            {isPickupAvailable && (
              <SelectItem value="pickup">{pickupLabel}</SelectItem>
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
          schoolMode={currentSchoolMode}
          bigSchool={currentBigSchool}
          teacherList={currentTeacherList}
        />
      )}
    </div>
  );
};
