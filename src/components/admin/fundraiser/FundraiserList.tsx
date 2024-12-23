import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Trash2, ExternalLink, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FundraiserForm } from './FundraiserForm';
import type { Fundraiser } from './types';

export const FundraiserList = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingFundraiser, setEditingFundraiser] = useState<Fundraiser | null>(null);

  const { data: fundraisers, refetch } = useQuery({
    queryKey: ['fundraisers', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('fundraisers')
        .select(`
          *,
          fundraiser_variations (
            id,
            title,
            image_path,
            is_default
          )
        `);

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,custom_link.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Fundraiser[];
    },
  });

  const deleteFundraiser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fundraisers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Fundraiser deleted",
        description: "The fundraiser has been deleted successfully."
      });

      refetch();
    } catch (error) {
      console.error('Error deleting fundraiser:', error);
      toast({
        title: "Error",
        description: "Failed to delete fundraiser. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search fundraisers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Donation Type</TableHead>
              <TableHead>Donation %/Amount</TableHead>
              <TableHead>Variations</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fundraisers?.map((fundraiser) => (
              <TableRow key={fundraiser.id}>
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
                    onClick={() => setEditingFundraiser(fundraiser)}
                  >
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteFundraiser(fundraiser.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingFundraiser} onOpenChange={() => setEditingFundraiser(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Fundraiser</DialogTitle>
          </DialogHeader>
          {editingFundraiser && (
            <FundraiserForm 
              fundraiser={editingFundraiser}
              onSuccess={() => {
                setEditingFundraiser(null);
                refetch();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};