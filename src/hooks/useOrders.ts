import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/order';

export const useOrders = (searchTerm: string, statusFilter: string, orderTypeFilter: string) => {
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', searchTerm, statusFilter, orderTypeFilter],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('*');

      // Apply status filter if not "all"
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Apply order type filter
      if (orderTypeFilter === 'fundraiser') {
        query = query.eq('is_fundraiser', true);
      } else {
        query = query.eq('is_fundraiser', false);
      }

      // Apply search filter if searchTerm exists
      if (searchTerm) {
        query = query.or(`customer_email.ilike.%${searchTerm}%,product_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      return data as Order[];
    },
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
    orders,
    isLoading,
    updateOrderStatus,
    deleteOrder,
  };
};