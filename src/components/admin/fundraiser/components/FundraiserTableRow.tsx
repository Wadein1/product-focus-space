
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink, Edit, Trash2 } from "lucide-react";
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
  const getDonationAmount = () => {
    if (fundraiser.donation_type === 'percentage') {
      // Calculate donation amount based on base price and percentage
      const amount = (fundraiser.base_price * fundraiser.donation_percentage) / 100;
      return `$${amount.toFixed(2)}`;
    } else {
      return `$${(fundraiser.donation_amount || 0).toFixed(2)}`;
    }
  };

  return (
    <TableRow>
      <TableCell>{fundraiser.title}</TableCell>
      <TableCell>
        <a
          href={`/fundraiser/${fundraiser.custom_link}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          {fundraiser.custom_link}
          <ExternalLink className="w-4 h-4 ml-1" />
        </a>
      </TableCell>
      <TableCell>{getDonationAmount()}</TableCell>
      <TableCell className="text-green-600 font-medium">
        ${(fundraiser.total_raised || 0).toFixed(2)}
      </TableCell>
      <TableCell className="text-blue-600 font-medium">
        ${(fundraiser.profit || 0).toFixed(2)}
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
