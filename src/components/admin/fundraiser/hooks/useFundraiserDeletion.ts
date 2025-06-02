
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
      console.log('=== STARTING FUNDRAISER DELETION ===');
      console.log('Fundraiser to delete:', fundraiser.id, fundraiser.title);

      // Step 1: Verify fundraiser exists before deletion
      const { data: beforeCheck, error: beforeError } = await supabase
        .from('fundraisers')
        .select('id, title')
        .eq('id', fundraiser.id)
        .single();

      if (beforeError || !beforeCheck) {
        console.error('Fundraiser not found in database:', beforeError);
        throw new Error('Fundraiser not found in database');
      }

      console.log('Confirmed fundraiser exists:', beforeCheck);

      // Step 2: Delete from fundraiser_totals (if exists)
      console.log('Deleting from fundraiser_totals...');
      const { error: totalsError } = await supabase
        .from('fundraiser_totals')
        .delete()
        .eq('fundraiser_id', fundraiser.id);

      if (totalsError) {
        console.error('Error deleting from fundraiser_totals:', totalsError);
        // Continue anyway as this table might not have records
      }

      // Step 3: Delete from fundraiser_transactions
      console.log('Deleting from fundraiser_transactions...');
      const { error: transactionsError } = await supabase
        .from('fundraiser_transactions')
        .delete()
        .eq('fundraiser_id', fundraiser.id);

      if (transactionsError) {
        console.error('Error deleting fundraiser transactions:', transactionsError);
        throw new Error(`Failed to delete fundraiser transactions: ${transactionsError.message}`);
      }

      // Step 4: Delete from fundraiser_orders
      console.log('Deleting from fundraiser_orders...');
      const { error: ordersError } = await supabase
        .from('fundraiser_orders')
        .delete()
        .eq('fundraiser_id', fundraiser.id);

      if (ordersError) {
        console.error('Error deleting fundraiser orders:', ordersError);
        throw new Error(`Failed to delete fundraiser orders: ${ordersError.message}`);
      }

      // Step 5: Get variations for image cleanup
      console.log('Getting variations for cleanup...');
      const { data: variations, error: variationsError } = await supabase
        .from('fundraiser_variations')
        .select('image_path')
        .eq('fundraiser_id', fundraiser.id);

      if (variationsError) {
        console.error('Error fetching variations:', variationsError);
        // Continue with deletion even if we can't get variations
      }

      // Step 6: Delete fundraiser variations
      console.log('Deleting fundraiser variations...');
      const { error: deleteVariationsError } = await supabase
        .from('fundraiser_variations')
        .delete()
        .eq('fundraiser_id', fundraiser.id);

      if (deleteVariationsError) {
        console.error('Error deleting fundraiser variations:', deleteVariationsError);
        throw new Error(`Failed to delete fundraiser variations: ${deleteVariationsError.message}`);
      }

      // Step 7: Update orders that reference this fundraiser
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
        throw new Error(`Failed to update orders: ${updateOrdersError.message}`);
      }

      // Step 8: Clean up images from storage
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
          }
        }
      }

      // Step 9: Delete the main fundraiser record - THIS IS CRITICAL
      console.log('Deleting main fundraiser record...');
      const { error: deleteFundraiserError, data: deleteData } = await supabase
        .from('fundraisers')
        .delete()
        .eq('id', fundraiser.id)
        .select();

      if (deleteFundraiserError) {
        console.error('CRITICAL ERROR - Failed to delete fundraiser:', deleteFundraiserError);
        throw new Error(`Failed to delete fundraiser: ${deleteFundraiserError.message}`);
      }

      console.log('Delete operation result:', deleteData);

      if (!deleteData || deleteData.length === 0) {
        console.error('CRITICAL ERROR - No rows were deleted from fundraisers table');
        throw new Error('No fundraiser record was deleted. The fundraiser may not exist or there may be a constraint preventing deletion.');
      }

      console.log('✅ Successfully deleted fundraiser from database');

      // Step 10: Verify the fundraiser is actually gone
      console.log('Verifying deletion...');
      const { data: afterCheck, error: afterError } = await supabase
        .from('fundraisers')
        .select('id')
        .eq('id', fundraiser.id)
        .maybeSingle();

      if (afterError) {
        console.error('Error verifying deletion:', afterError);
      } else if (afterCheck) {
        console.error('CRITICAL ERROR - Fundraiser still exists after deletion:', afterCheck);
        throw new Error('Fundraiser deletion failed - record still exists in database');
      } else {
        console.log('✅ Verified: Fundraiser successfully deleted from database');
      }

      // Step 11: Force React Query to refetch data
      console.log('Invalidating React Query cache...');
      await queryClient.invalidateQueries({ queryKey: ['fundraisers'] });
      console.log('Cache invalidated');

      // Step 12: Manual refetch as backup
      console.log('Triggering manual refetch...');
      await refetch();
      console.log('Manual refetch completed');

      toast({
        title: "Fundraiser deleted",
        description: `"${fundraiser.title}" has been deleted successfully.`
      });

      setDeletingFundraiser(null);
      console.log('=== FUNDRAISER DELETION COMPLETED SUCCESSFULLY ===');
      
    } catch (error: any) {
      console.error('=== FUNDRAISER DELETION FAILED ===');
      console.error('Error details:', error);
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
