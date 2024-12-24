import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useFundraiserTotals(fundraiserId: string) {
  return useQuery({
    queryKey: ['fundraiser-totals', fundraiserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('calculate_fundraiser_totals', {
          fundraiser_id: fundraiserId
        });

      if (error) throw error;
      return data;
    },
    enabled: !!fundraiserId
  });
}