import React from 'react';
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
import { useToast } from "@/hooks/use-toast";
import { Trash2, ExternalLink } from "lucide-react";

export const FundraiserList = () => {
  const { toast } = useToast();

  const { data: fundraisers, refetch } = useQuery({
    queryKey: ['fundraisers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fundraisers')
        .select(`
          *,
          fundraiser_variations (
            id,
            title,
            image_path
          ),
          fundraiser_orders (
            amount,
            donation_amount
          )
        `);

      if (error) throw error;
      return data;
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Link</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Donation %</TableHead>
            <TableHead>Variations</TableHead>
            <TableHead>Total Raised</TableHead>
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
              <TableCell>{fundraiser.donation_percentage}%</TableCell>
              <TableCell>{fundraiser.fundraiser_variations?.length || 0}</TableCell>
              <TableCell>
                ${fundraiser.fundraiser_orders?.reduce((sum, order) => sum + Number(order.donation_amount), 0).toFixed(2)}
              </TableCell>
              <TableCell>
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
  );
};