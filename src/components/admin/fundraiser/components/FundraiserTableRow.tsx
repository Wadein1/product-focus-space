
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Fundraiser } from '../types';

interface FundraiserTableRowProps {
  fundraiser: Fundraiser & {
    total_raised?: number;
    profit?: number;
  };
  onEdit: (fundraiser: Fundraiser) => void;
  onDelete: (fundraiser: Fundraiser) => void;
  isDeleting: boolean;
}

export const FundraiserTableRow: React.FC<FundraiserTableRowProps> = ({
  fundraiser,
  onEdit,
  onDelete,
  isDeleting
}) => {
  const { toast } = useToast();

  const getDonationAmount = () => {
    if (fundraiser.donation_type === 'percentage') {
      // Calculate donation amount based on base price and percentage
      const amount = (fundraiser.base_price * fundraiser.donation_percentage) / 100;
      return `$${amount.toFixed(2)}`;
    } else {
      return `$${(fundraiser.donation_amount || 0).toFixed(2)}`;
    }
  };

  const toggleShippingOption = async (field: 'allow_team_shipping' | 'allow_regular_shipping', currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('fundraisers')
        .update({ [field]: !currentValue })
        .eq('id', fundraiser.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Shipping option updated successfully`,
      });
    } catch (error) {
      console.error('Error updating shipping option:', error);
      toast({
        title: "Error",
        description: "Failed to update shipping option",
        variant: "destructive",
      });
    }
  };

  return (
    <TableRow>
      <TableCell>
        <a
          href={`/fundraiser/${fundraiser.custom_link}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
        >
          {fundraiser.title}
        </a>
      </TableCell>
      <TableCell>{getDonationAmount()}</TableCell>
      <TableCell className="text-green-600 font-medium">
        ${(fundraiser.total_raised || 0).toFixed(2)}
      </TableCell>
      <TableCell className="text-blue-600 font-medium">
        ${(fundraiser.profit || 0).toFixed(2)}
      </TableCell>
      <TableCell>
        <Switch
          checked={fundraiser.allow_team_shipping ?? true}
          onCheckedChange={() => toggleShippingOption('allow_team_shipping', fundraiser.allow_team_shipping ?? true)}
        />
      </TableCell>
      <TableCell>
        <Switch
          checked={fundraiser.allow_regular_shipping ?? true}
          onCheckedChange={() => toggleShippingOption('allow_regular_shipping', fundraiser.allow_regular_shipping ?? true)}
        />
      </TableCell>
      <TableCell className="space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(fundraiser)}
        >
          <Edit className="w-4 h-4 mr-1" /> Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(fundraiser)}
          disabled={isDeleting}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};
