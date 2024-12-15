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

        console.log('Query built, executing...');
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Query timeout after 10s')), 10000);
        });

        const queryPromise = query;
        
        const { data: rawData, error: queryError } = await Promise.race([
          queryPromise,
          timeoutPromise
        ]) as any;
        
        console.log('Query completed');
        
        if (queryError) {
          console.error('Supabase query error:', queryError);
          throw new Error(`Supabase query failed: ${queryError.message}`);
        }

        if (!rawData) {
          console.log('No data returned');
          return [];
        }
        
        console.log('Raw data received, count:', rawData.length);
        
        const mappedOrders = rawData.map((rawOrder: RawOrder) => {
          try {
            return mapRawOrderToOrder(rawOrder);
          } catch (err) {
            console.error('Error mapping order:', err, rawOrder);
            throw new Error(`Failed to map order: ${err instanceof Error ? err.message : 'Unknown error'}`);
          }
        });

        console.log('Orders mapped successfully, count:', mappedOrders.length);
        return mappedOrders;
      } catch (error) {
        console.error('Error in useOrders query:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
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