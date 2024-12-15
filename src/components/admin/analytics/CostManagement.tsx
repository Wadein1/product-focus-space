import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CostManagementProps {
  analytics: {
    daily: number;
    dailyCount: number;
  } | undefined;
}

export function CostManagement({ analytics }: CostManagementProps) {
  const [shippingCost, setShippingCost] = useState<string>("");
  const [materialCost, setMaterialCost] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateCostsMutation = useMutation({
    mutationFn: async ({ shipping, material }: { shipping: number; material: number }) => {
      const today = new Date().toISOString().split('T')[0];
      
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

  return (
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
  );
}