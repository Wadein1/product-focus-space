import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash, Package, Lock } from "lucide-react";

interface Item {
  id: string;
  name: string;
  category_id: string;
  description: string | null;
  par_level: number;
  is_locked?: boolean;
  inventory_categories?: {
    name: string;
  };
}

interface ItemListProps {
  items: Item[];
  onViewDetails: (item: Item) => void;
  onDeleteItem: (item: Item) => void;
}

export const ItemList = ({ items, onViewDetails, onDeleteItem }: ItemListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Par Level</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="w-[150px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items?.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="flex items-center gap-2">
              {item.name}
              {item.is_locked && (
                <Lock className="h-4 w-4 text-gray-400" />
              )}
            </TableCell>
            <TableCell>{item.inventory_categories?.name}</TableCell>
            <TableCell>{item.par_level}</TableCell>
            <TableCell>{item.description}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(item)}
                >
                  <Package className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteItem(item)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};