import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { FundraiserTable } from './components/FundraiserTable';
import { EditDialog } from './components/EditDialog';
import { DeleteConfirmationDialog } from './components/DeleteConfirmationDialog';
import { useFundraiserDeletion } from './hooks/useFundraiserDeletion';
import type { Fundraiser } from './types';

export const FundraiserList = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingFundraiser, setEditingFundraiser] = useState<Fundraiser | null>(null);

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
            price,
            fundraiser_variation_images (
              id,
              image_path,
              display_order
            )
          ),
          fundraiser_age_divisions (
            id,
            division_name,
            display_order,
            fundraiser_teams (
              id,
              team_name,
              display_order
            )
          )
        `)
        .or(`title.ilike.%${searchTerm}%,custom_link.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching fundraisers:', error);
        throw error;
      }

      // Fetch additional stats for each fundraiser
      const fundraisersWithStats = await Promise.all(
        (data as Fundraiser[]).map(async (fundraiser) => {
          // Get fundraiser stats (total raised)
          const { data: statsData } = await supabase
            .from('fundraiser_totals')
            .select('total_raised')
            .eq('fundraiser_id', fundraiser.id)
            .maybeSingle();

          // Calculate profit using the new function
          const { data: profitData } = await supabase
            .rpc('calculate_fundraiser_profit', { fundraiser_id_param: fundraiser.id });

          return {
            ...fundraiser,
            total_raised: statsData?.total_raised || 0,
            profit: profitData || 0
          };
        })
      );

      console.log('Fetched fundraisers:', fundraisersWithStats);
      console.log('Total fundraisers count:', fundraisersWithStats?.length || 0);
      return fundraisersWithStats;
    },
    retry: 1,
  });

  // Enhanced refetch function with cache invalidation
  const enhancedRefetch = async () => {
    console.log('Enhanced refetch triggered - invalidating cache and refetching...');
    await queryClient.invalidateQueries({ queryKey: ['fundraisers'] });
    await refetch();
    console.log('Enhanced refetch completed');
  };

  const {
    deletingFundraiser,
    isDeleting,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel
  } = useFundraiserDeletion(enhancedRefetch);

  if (isLoading) {
    console.log('Loading fundraisers...');
    return <div>Loading fundraisers...</div>;
  }
  
  if (error) {
    console.error('Error in FundraiserList:', error);
    return <div>Error loading fundraisers: {error.message}</div>;
  }

  console.log('Rendering FundraiserList with', fundraisers?.length || 0, 'fundraisers');

  return (
    <div>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search fundraisers..."
          value={searchTerm}
          onChange={(e) => {
            console.log('Search term changed to:', e.target.value);
            setSearchTerm(e.target.value);
          }}
        />
      </div>

      <FundraiserTable
        fundraisers={fundraisers || []}
        onEdit={setEditingFundraiser}
        onDelete={handleDeleteClick}
        isDeleting={isDeleting}
      />

      <EditDialog
        fundraiser={editingFundraiser}
        onClose={() => setEditingFundraiser(null)}
        onSuccess={enhancedRefetch}
      />

      <DeleteConfirmationDialog
        fundraiser={deletingFundraiser}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};
