
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

export const useFundraiserData = (customLink: string | undefined) => {
  const fundraiserQuery = useQuery({
    queryKey: ['fundraiser', customLink],
    queryFn: async () => {
      console.log('Fetching fundraiser data for:', customLink);
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
          )
        `)
        .eq('custom_link', customLink)
        .single();

      if (error) {
        console.error('Fundraiser fetch error:', error);
        throw error;
      }
      console.log('Fundraiser data loaded:', data);
      return data;
    },
    retry: 2,
    retryDelay: 500,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const fundraiserStatsQuery = useQuery({
    queryKey: ['fundraiser-stats', fundraiserQuery.data?.id],
    queryFn: async () => {
      if (!fundraiserQuery.data?.id) return null;
      
      console.log('Fetching fundraiser stats for:', fundraiserQuery.data.id);
      const { data, error } = await supabase
        .from('fundraiser_totals')
        .select('total_items_sold, total_raised')
        .eq('fundraiser_id', fundraiserQuery.data.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching fundraiser stats:', error);
        return { total_items_sold: 0, total_raised: 0 };
      }

      console.log('Fundraiser stats loaded:', data);
      return data || { total_items_sold: 0, total_raised: 0 };
    },
    enabled: !!fundraiserQuery.data?.id,
    refetchInterval: 60000, // Reduced from 10s to 60s
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    fundraiser: fundraiserQuery.data,
    fundraiserStats: fundraiserStatsQuery.data,
    isLoading: fundraiserQuery.isLoading,
    error: fundraiserQuery.error,
  };
};
