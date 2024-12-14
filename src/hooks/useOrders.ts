import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderStatus } from '@/types/admin';
import { useToast } from "@/hooks/use-toast";

interface RawOrder {
  cart_id: string | null;
  created_at: string;
  customer_email: string;
  design_notes: string | null;
  id: string;
  image_path: string | null;
  order_status: string | null;
  price: number;
  product_name: string;
  shipping_address: Record<string, unknown>;
  shipping_cost: number;
  status: string;
  stl_file_path: string | null;
  tax_amount: number;
  total_amount: number;
}

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

      return (data as RawOrder[]).map((order) => ({
        ...order,
        shipping_address: {
          street: String(order.shipping_address?.street || ''),
          city: String(order.shipping_address?.city || ''),
          state: String(order.shipping_address?.state || ''),
          zipCode: String(order.shipping_address?.zipCode || '')
        }
      })) as Order[];
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