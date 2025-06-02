
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Fundraiser } from '../types';

export const useFundraiserDeletion = (refetch: () => void) => {
  const { toast } = useToast();
  const [deletingFundraiser, setDeletingFundraiser] = useState<Fundraiser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      }

      // Step 3: Delete fundraiser orders
      const { error: ordersError } = await supabase
        .from('fundraiser_orders')
        .delete()
        .eq('fundraiser_id', fundraiser.id);

      if (ordersError) {
        console.error('Error deleting fundraiser orders:', ordersError);
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

  const handleDeleteConfirm = () => {
    if (deletingFundraiser) {
      deleteFundraiser(deletingFundraiser);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingFundraiser(null);
  };

  return {
    deletingFundraiser,
    isDeleting,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel
  };
};
