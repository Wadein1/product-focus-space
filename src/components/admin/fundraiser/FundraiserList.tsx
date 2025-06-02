
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { FundraiserTable } from './components/FundraiserTable';
import { EditDialog } from './components/EditDialog';
import { DeleteConfirmationDialog } from './components/DeleteConfirmationDialog';
import { useFundraiserDeletion } from './hooks/useFundraiserDeletion';
import type { Fundraiser } from './types';

export const FundraiserList = () => {
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

  const {
    deletingFundraiser,
    isDeleting,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel
  } = useFundraiserDeletion(refetch);

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

      <FundraiserTable
        fundraisers={fundraisers || []}
        onEdit={setEditingFundraiser}
        onDelete={handleDeleteClick}
        isDeleting={isDeleting}
      />

      <EditDialog
        fundraiser={editingFundraiser}
        onClose={() => setEditingFundraiser(null)}
        onSuccess={refetch}
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
