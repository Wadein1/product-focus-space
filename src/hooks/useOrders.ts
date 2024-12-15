import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Order, OrderStatus, RawOrder } from "@/types/order";
import { mapRawOrderToOrder } from "@/utils/orderUtils";

export function useOrders(searchTerm: string = "", statusFilter: string = "all", page: number = 1) {
  const queryClient = useQueryClient();
  const PAGE_SIZE = 20;

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', searchTerm, statusFilter, page],
    queryFn: async () => {
      console.log('Starting order fetch with params:', { searchTerm, statusFilter, page });
      try {
        let query = supabase
          .from('orders')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false });

        console.log('Base query constructed');

        // Add pagination
        query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
        console.log('Pagination added to query');

        // Add filters if present
        if (searchTerm) {
          query = query.or(`customer_email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);
          console.log('Search filter added:', searchTerm);
        }

        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
          console.log('Status filter added:', statusFilter);
        }

        console.log('Executing query...');
        const { data: rawData, error: queryError, count } = await query;
        
        if (queryError) {
          console.error('Query error:', queryError);
          throw queryError;
        }

        console.log('Query completed. Raw data count:', rawData?.length);

        if (!rawData) {
          console.log('No data returned from query');
          return { orders: [], totalCount: 0 };
        }

        console.log('Mapping orders...');
        const mappedOrders = rawData.map((rawOrder: RawOrder) => {
          try {
            return mapRawOrderToOrder(rawOrder);
          } catch (err) {
            console.error('Error mapping order:', err, rawOrder);
            return null;
          }
        }).filter(Boolean) as Order[];

        console.log('Orders mapped successfully. Count:', mappedOrders.length);

        return { 
          orders: mappedOrders,
          totalCount: count || 0
        };
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
      console.log('Updating order status:', { orderId, newStatus });
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) {
        console.error('Error updating order status:', error);
        throw error;
      }
      console.log('Order status updated successfully');
    },
    onSuccess: () => {
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
      console.log('Order deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  return {
    orders: orders?.orders || [],
    totalCount: orders?.totalCount || 0,
    isLoading,
    error,
    updateOrderStatus,
    deleteOrder,
  };
}