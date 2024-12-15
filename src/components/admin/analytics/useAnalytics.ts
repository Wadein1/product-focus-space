import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, shipping_cost, created_at')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const today = new Date();
      const dailyOrders = orders?.filter(order => 
        new Date(order.created_at).toDateString() === today.toDateString()
      );

      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const weeklyOrders = orders?.filter(order => 
        new Date(order.created_at) >= weekAgo
      );

      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const monthlyOrders = orders?.filter(order => 
        new Date(order.created_at) >= monthAgo
      );

      const calculateTotal = (ordersList: any[]) => 
        ordersList.reduce((sum, order) => sum + Number(order.total_amount), 0);

      const calculateOrderCount = (ordersList: any[]) => ordersList.length;

      return {
        daily: calculateTotal(dailyOrders || []),
        weekly: calculateTotal(weeklyOrders || []),
        monthly: calculateTotal(monthlyOrders || []),
        yearly: calculateTotal(orders || []),
        dailyCount: calculateOrderCount(dailyOrders || []),
        weeklyCount: calculateOrderCount(weeklyOrders || []),
        monthlyCount: calculateOrderCount(monthlyOrders || []),
        yearlyCount: calculateOrderCount(orders || [])
      };
    }
  });
}