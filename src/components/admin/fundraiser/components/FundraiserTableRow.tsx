
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink, Edit, Trash2 } from "lucide-react";
import type { Fundraiser } from '../types';

interface FundraiserTableRowProps {
  fundraiser: Fundraiser;
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
      <TableCell>${fundraiser.base_price}</TableCell>
      <TableCell>{fundraiser.donation_type}</TableCell>
      <TableCell>
        {fundraiser.donation_type === 'percentage' 
          ? `${fundraiser.donation_percentage}%`
          : `$${fundraiser.donation_amount}`}
      </TableCell>
      <TableCell>{fundraiser.fundraiser_variations?.length || 0}</TableCell>
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
