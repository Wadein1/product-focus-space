import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Order, OrderStatus, RawOrder } from "@/types/order";
import { mapRawOrderToOrder } from "@/utils/orderUtils";

export function useOrders(searchTerm: string = "", statusFilter: string = "all") {
  const queryClient = useQueryClient();

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', searchTerm, statusFilter],
    queryFn: async () => {
      console.log('Fetching orders with:', { searchTerm, statusFilter });
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

        console.log('Executing Supabase query...');
        const { data: rawData, error: queryError } = await query.limit(50);
        
        if (queryError) {
          console.error('Supabase query error:', queryError);
          throw queryError;
        }

        if (!rawData) {
          console.log('No data returned from Supabase');
          return [];
        }
        
        console.log('Raw data from Supabase:', rawData);
        
        const mappedOrders = rawData.map((rawOrder: RawOrder) => {
          try {
            console.log('Mapping order:', rawOrder);
            const mappedOrder = mapRawOrderToOrder(rawOrder);
            console.log('Successfully mapped order:', mappedOrder);
            return mappedOrder;
          } catch (err) {
            console.error('Error mapping specific order:', err, rawOrder);
            throw err;
          }
        });

        console.log('All orders mapped successfully:', mappedOrders);
        return mappedOrders;
      } catch (error) {
        console.error('Error in useOrders query:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60, // Consider data fresh for 1 minute
    retry: 1,
    meta: {
      errorMessage: 'Failed to fetch orders'
    }
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: string }) => {
      console.log('Updating order status:', { orderId, newStatus });
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) {
        console.error('Error updating order status:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Status update successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const deleteOrder = useMutation({
    mutationFn: async (orderId: string) => {
      console.log('Deleting order:', orderId);
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);
      
      if (error) {
        console.error('Error deleting order:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Order deletion successful, invalidating queries');
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