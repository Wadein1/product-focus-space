import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderStatus, RawOrder } from '@/types/order';
import { mapRawOrderToOrder } from '@/utils/orderUtils';
import { useToast } from "@/hooks/use-toast";

export function useOrders(searchTerm: string, statusFilter: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders', searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`customer_email.ilike.%${searchTerm}%,product_name.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching orders",
          description: error.message,
        });
        throw error;
      }

      return (data as RawOrder[]).map(mapRawOrderToOrder);
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: OrderStatus }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({
        title: "Order status updated",
        description: "The order status has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error updating order status",
        description: error.message,
      });
    },
  });

  return {
    orders,
    isLoading,
    updateOrderStatus
  };
}