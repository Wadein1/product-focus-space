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

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics')
        .select('*')
        .order('date', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data?.[0];
    }
  });

  const updateCostsMutation = useMutation({
    mutationFn: async ({ shipping, material }: { shipping: number; material: number }) => {
      const { error } = await supabase
        .from('analytics')
        .insert([
          {
            shipping_cost: shipping,
            material_cost: material,
          }
        ]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
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

  if (isLoading) {
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
                placeholder={analytics?.shipping_cost?.toString() || "0.00"}
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
                placeholder={analytics?.material_cost?.toString() || "0.00"}
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

      <ProfitChart />
    </div>
  );
}