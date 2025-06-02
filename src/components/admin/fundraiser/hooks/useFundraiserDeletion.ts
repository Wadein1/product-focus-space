
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import type { Fundraiser } from '../types';

export const useFundraiserDeletion = (refetch: () => void) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deletingFundraiser, setDeletingFundraiser] = useState<Fundraiser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteFundraiser = async (fundraiser: Fundraiser) => {
    setIsDeleting(true);
    try {
      console.log('Starting deletion process for fundraiser:', fundraiser.id);
      console.log('Current fundraiser data:', fundraiser);

      // Log current fundraiser list before deletion
      console.log('Checking current fundraiser list before deletion...');
      const { data: beforeData } = await supabase
        .from('fundraisers')
        .select('id, title')
        .order('created_at', { ascending: false });
      console.log('Fundraisers before deletion:', beforeData);

      // Step 1: Get all image paths from variations to clean up storage
      const { data: variations, error: variationsError } = await supabase
        .from('fundraiser_variations')
        .select('image_path')
        .eq('fundraiser_id', fundraiser.id);

      if (variationsError) {
        console.error('Error fetching variations for cleanup:', variationsError);
        // Don't throw here, continue with deletion
      }

      console.log('Found variations for cleanup:', variations);

      // Step 2: Delete fundraiser transactions (if any) - more robust approach
      console.log('Deleting fundraiser transactions...');
      const { error: transactionsError } = await supabase
        .from('fundraiser_transactions')
        .delete()
        .eq('fundraiser_id', fundraiser.id);

      if (transactionsError) {
        console.error('Error deleting fundraiser transactions:', transactionsError);
        // Don't throw here, continue with deletion
      }

      // Step 3: Delete fundraiser orders - more robust approach
      console.log('Deleting fundraiser orders...');
      const { error: ordersError } = await supabase
        .from('fundraiser_orders')
        .delete()
        .eq('fundraiser_id', fundraiser.id);

      if (ordersError) {
        console.error('Error deleting fundraiser orders:', ordersError);
        // Don't throw here, continue with deletion
      }

      // Step 4: Update any orders that reference this fundraiser
      console.log('Updating orders that reference this fundraiser...');
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
      console.log('Deleting fundraiser variations...');
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
      console.log('Deleting main fundraiser record...');
      const { error: deleteFundraiserError } = await supabase
        .from('fundraisers')
        .delete()
        .eq('id', fundraiser.id);

      if (deleteFundraiserError) {
        console.error('CRITICAL ERROR - Failed to delete fundraiser:', deleteFundraiserError);
        throw new Error(`Failed to delete fundraiser: ${deleteFundraiserError.message}`);
      }

      console.log('Fundraiser deleted successfully from database');

      // Step 8: Wait a moment for database consistency
      console.log('Waiting for database consistency...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 9: Verify deletion by checking database
      console.log('Verifying deletion...');
      const { data: afterData } = await supabase
        .from('fundraisers')
        .select('id, title')
        .order('created_at', { ascending: false });
      console.log('Fundraisers after deletion:', afterData);

      // Step 10: Invalidate all fundraiser-related queries to force React Query to refetch
      console.log('Invalidating React Query cache...');
      await queryClient.invalidateQueries({ queryKey: ['fundraisers'] });
      
      // Also trigger manual refetch as backup
      console.log('Triggering manual refetch...');
      await refetch();

      toast({
        title: "Fundraiser deleted",
        description: `"${fundraiser.title}" has been deleted successfully.`
      });

      // Reset deletion state
      setDeletingFundraiser(null);
      console.log('Deletion process completed successfully');
      
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
    console.log('Delete clicked for fundraiser:', fundraiser);
    setDeletingFundraiser(fundraiser);
  };

  const handleDeleteConfirm = () => {
    console.log('Delete confirmed for fundraiser:', deletingFundraiser);
    if (deletingFundraiser) {
      deleteFundraiser(deletingFundraiser);
    }
  };

  const handleDeleteCancel = () => {
    console.log('Delete cancelled');
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
