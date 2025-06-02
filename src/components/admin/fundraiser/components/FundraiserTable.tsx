
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FundraiserTableRow } from './FundraiserTableRow';
import type { Fundraiser } from '../types';

interface FundraiserTableProps {
  fundraisers: Fundraiser[];
  onEdit: (fundraiser: Fundraiser) => void;
  onDelete: (fundraiser: Fundraiser) => void;
  isDeleting: boolean;
}

export const FundraiserTable: React.FC<FundraiserTableProps> = ({
  fundraisers,
  onEdit,
  onDelete,
  isDeleting
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Link</TableHead>
            <TableHead>Donation Amount</TableHead>
            <TableHead>Money Raised</TableHead>
            <TableHead>Your Profit</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fundraisers?.map((fundraiser) => (
            <FundraiserTableRow
              key={fundraiser.id}
              fundraiser={fundraiser}
              onEdit={onEdit}
              onDelete={onDelete}
              isDeleting={isDeleting}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
