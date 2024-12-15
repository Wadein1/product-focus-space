import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProfitChart } from "./ProfitChart";

export function AnalyticsSection() {
  const [shippingCost, setShippingCost] = useState<string>("");
  const [materialCost, setMaterialCost] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
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

  const updateCostsMutation = useMutation({
    mutationFn: async ({ shipping, material }: { shipping: number; material: number }) => {
      const today = new Date().toISOString().split('T')[0];
      
      // Calculate daily profit
      const dailyProfit = analytics ? 
        analytics.daily - (shipping * analytics.dailyCount) - (material * analytics.dailyCount) : 0;

      const { error } = await supabase
        .from('analytics')
        .insert([
          {
            date: today,
            shipping_cost: shipping,
            material_cost: material,
            total_sales: analytics?.daily || 0,
            total_orders: analytics?.dailyCount || 0,
            profit: dailyProfit
          }
        ]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['profit-analytics'] });
      toast({
        title: "Costs updated",
        description: "The costs have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update costs.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateCosts = () => {
    const shipping = parseFloat(shippingCost);
    const material = parseFloat(materialCost);

    if (isNaN(shipping) || isNaN(material)) {
      toast({
        title: "Invalid input",
        description: "Please enter valid numbers for both costs.",
        variant: "destructive",
      });
      return;
    }

    updateCostsMutation.mutate({ shipping, material });
  };

  if (analyticsLoading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cost Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="shippingCost" className="text-sm font-medium">
                Average Shipping Cost ($)
              </label>
              <Input
                id="shippingCost"
                type="number"
                step="0.01"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="materialCost" className="text-sm font-medium">
                Average Material Cost ($)
              </label>
              <Input
                id="materialCost"
                type="number"
                step="0.01"
                value={materialCost}
                onChange={(e) => setMaterialCost(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <Button 
            onClick={handleUpdateCosts}
            disabled={updateCostsMutation.isPending}
          >
            Update Costs
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-background rounded-lg border">
              <p className="text-sm text-muted-foreground">Daily Sales</p>
              <p className="text-2xl font-bold">
                ${analytics?.daily.toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <p className="text-sm text-muted-foreground">Weekly Sales</p>
              <p className="text-2xl font-bold">
                ${analytics?.weekly.toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <p className="text-sm text-muted-foreground">Monthly Sales</p>
              <p className="text-2xl font-bold">
                ${analytics?.monthly.toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <p className="text-sm text-muted-foreground">Yearly Sales</p>
              <p className="text-2xl font-bold">
                ${analytics?.yearly.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProfitChart />
    </div>
  );
}