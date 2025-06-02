
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
        // Don't throw here, continue with deletion
      }

      // Step 2: Delete fundraiser transactions (if any) - more robust approach
      const { error: transactionsError } = await supabase
        .from('fundraiser_transactions')
        .delete()
        .eq('fundraiser_id', fundraiser.id);

      if (transactionsError) {
        console.error('Error deleting fundraiser transactions:', transactionsError);
        // Don't throw here, continue with deletion
      }

      // Step 3: Delete fundraiser orders - more robust approach
      const { error: ordersError } = await supabase
        .from('fundraiser_orders')
        .delete()
        .eq('fundraiser_id', fundraiser.id);

      if (ordersError) {
        console.error('Error deleting fundraiser orders:', ordersError);
        // Don't throw here, continue with deletion
      }

      // Step 4: Update any orders that reference this fundraiser
      const { error: updateOrdersError } = await supabase
        .from('orders')
        .update({ 
          fundraiser_id: null, 
          variation_id: null,
          is_fundraiser: false 
        })
        .eq('fundraiser_id', fundraiser.id);

      if (updateOrdersError) {
        console.error('Error updating orders:', updateOrdersError);
        // Don't throw here, continue with deletion
      }

      // Step 5: Delete associated variations - this is critical
      const { error: deleteVariationsError } = await supabase
        .from('fundraiser_variations')
        .delete()
        .eq('fundraiser_id', fundraiser.id);

      if (deleteVariationsError) {
        console.error('Error deleting fundraiser variations:', deleteVariationsError);
        // Don't throw here, continue with deletion to ensure main record is removed
      }

      // Step 6: Clean up images from storage (if variations were found)
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
            console.warn('Error cleaning up images (non-critical):', storageError);
            // Don't throw here, image cleanup is not critical
          }
        }
      }

      // Step 7: Finally delete the fundraiser - THIS IS THE MOST IMPORTANT STEP
      const { error: deleteFundraiserError } = await supabase
        .from('fundraisers')
        .delete()
        .eq('id', fundraiser.id);

      if (deleteFundraiserError) {
        console.error('CRITICAL ERROR - Failed to delete fundraiser:', deleteFundraiserError);
        throw new Error(`Failed to delete fundraiser: ${deleteFundraiserError.message}`);
      }

      console.log('Fundraiser deleted successfully from database');

      toast({
        title: "Fundraiser deleted",
        description: `"${fundraiser.title}" has been deleted successfully.`
      });

      // Force immediate refetch to update the UI
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
