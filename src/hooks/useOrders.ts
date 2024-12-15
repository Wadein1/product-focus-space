import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Order, OrderStatus, RawOrder } from "@/types/order";
import { mapRawOrderToOrder } from "@/utils/orderUtils";

export function useOrders(searchTerm: string = "", statusFilter: string = "all") {
  const queryClient = useQueryClient();

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', searchTerm, statusFilter],
    queryFn: async () => {
      try {
        let query = supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (searchTerm) {
          query = query.or(`customer_email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);
        }

        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        // Limit to 50 orders initially for better performance
        query = query.limit(50);

        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching orders:', error);
          throw error;
        }

        if (!data) {
          return [];
        }
        
        // Map the raw database response to our Order type
        return data.map((rawOrder: any) => mapRawOrderToOrder(rawOrder));
      } catch (error) {
        console.error('Error in useOrders query:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60, // Consider data fresh for 1 minute
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const deleteOrder = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  return {
    orders: orders || [],
    isLoading,
    error,
    updateOrderStatus,
    deleteOrder,
  };
}