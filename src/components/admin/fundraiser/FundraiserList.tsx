
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FundraiserForm } from './FundraiserForm';
import type { Fundraiser } from './types';

export const FundraiserList = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingFundraiser, setEditingFundraiser] = useState<Fundraiser | null>(null);
  const [deletingFundraiser, setDeletingFundraiser] = useState<Fundraiser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: fundraisers, isLoading, error, refetch } = useQuery({
    queryKey: ['fundraisers', searchTerm],
    queryFn: async () => {
      console.log('Fetching fundraisers with search term:', searchTerm);
      const { data, error } = await supabase
        .from('fundraisers')
        .select(`
          *,
          fundraiser_variations (
            id,
            title,
            image_path,
            is_default,
            price
          )
        `)
        .or(`title.ilike.%${searchTerm}%,custom_link.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching fundraisers:', error);
        throw error;
      }
      console.log('Fetched fundraisers:', data);
      return data as Fundraiser[];
    },
    retry: 1,
  });

  const deleteFundraiser = async (fundraiser: Fundraiser) => {
    setIsDeleting(true);
    try {
      console.log('Starting deletion process for fundraiser:', fundraiser.id);

      // Step 1: Get all image paths from variations to clean up storage
      const { data: variations, error: variationsError } = await supabase
        .from('fundraiser_variations')
        .select('image_path')
        .eq('fundraiser_id', fundraiser.id);

      if (variationsError) {
        console.error('Error fetching variations for cleanup:', variationsError);
      }

      // Step 2: Delete fundraiser transactions (if any)
      const { error: transactionsError } = await supabase
        .from('fundraiser_transactions')
        .delete()
        .eq('fundraiser_id', fundraiser.id);

      if (transactionsError) {
        console.error('Error deleting fundraiser transactions:', transactionsError);
        // Don't throw here, continue with deletion
      }

      // Step 3: Delete fundraiser orders
      const { error: ordersError } = await supabase
        .from('fundraiser_orders')
        .delete()
        .eq('fundraiser_id', fundraiser.id);

      if (ordersError) {
        console.error('Error deleting fundraiser orders:', ordersError);
        // Don't throw here, continue with deletion
      }

      // Step 4: Delete associated variations
      const { error: deleteVariationsError } = await supabase
        .from('fundraiser_variations')
        .delete()
        .eq('fundraiser_id', fundraiser.id);

      if (deleteVariationsError) {
        console.error('Error deleting fundraiser variations:', deleteVariationsError);
        throw deleteVariationsError;
      }

      // Step 5: Clean up images from storage
      if (variations && variations.length > 0) {
        const imagePaths = variations
          .filter(v => v.image_path)
          .map(v => v.image_path);
        
        if (imagePaths.length > 0) {
          console.log('Cleaning up images:', imagePaths);
          const { error: storageError } = await supabase.storage
            .from('gallery')
            .remove(imagePaths);
          
          if (storageError) {
            console.warn('Error cleaning up images:', storageError);
            // Don't throw here, storage cleanup is not critical
          }
        }
      }

      // Step 6: Finally delete the fundraiser
      const { error: deleteFundraiserError } = await supabase
        .from('fundraisers')
        .delete()
        .eq('id', fundraiser.id);

      if (deleteFundraiserError) {
        console.error('Error deleting fundraiser:', deleteFundraiserError);
        throw deleteFundraiserError;
      }

      console.log('Fundraiser deleted successfully');
      toast({
        title: "Fundraiser deleted",
        description: `"${fundraiser.title}" has been deleted successfully.`
      });

      // Immediately refetch the data to update the UI
      await refetch();
      setDeletingFundraiser(null);
    } catch (error: any) {
      console.error('Error deleting fundraiser:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete fundraiser. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = (fundraiser: Fundraiser) => {
    setDeletingFundraiser(fundraiser);
  };

  if (isLoading) return <div>Loading fundraisers...</div>;
  if (error) return <div>Error loading fundraisers: {error.message}</div>;

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
                    onClick={() => handleDeleteClick(fundraiser)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingFundraiser} onOpenChange={() => setDeletingFundraiser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fundraiser</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingFundraiser?.title}"? This action cannot be undone and will remove:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>The fundraiser and all its variations</li>
                <li>All associated images</li>
                <li>All order history and transaction records</li>
                <li>All donation tracking data</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deletingFundraiser && deleteFundraiser(deletingFundraiser)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Fundraiser"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
