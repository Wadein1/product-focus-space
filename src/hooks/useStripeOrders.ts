import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Order } from '@/types/order';

export const useStripeOrders = (searchTerm: string, statusFilter: string, orderTypeFilter: string) => {
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['stripe-orders', searchTerm, statusFilter, orderTypeFilter],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-stripe-orders', {
        body: { searchTerm, statusFilter, orderTypeFilter }
      });

      if (error) throw error;
      return data.orders as Order[];
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: string }) => {
      const { error } = await supabase.functions.invoke('update-stripe-order', {
        body: { orderId, newStatus }
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripe-orders'] });
    },
  });

  return {
    orders,
    isLoading,
    updateOrderStatus,
  };
};