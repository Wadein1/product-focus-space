import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function ProfitChart() {
  const { data: profitData, isLoading } = useQuery({
    queryKey: ['profit-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics')
        .select('*')
        .order('date', { ascending: true })
        .limit(30);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div>Loading profit data...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={profitData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-background rounded-lg border">
            <p className="text-sm text-muted-foreground">Daily Profit</p>
            <p className="text-2xl font-bold">
              ${profitData?.[profitData.length - 1]?.profit.toFixed(2) || "0.00"}
            </p>
          </div>
          <div className="p-4 bg-background rounded-lg border">
            <p className="text-sm text-muted-foreground">Weekly Profit</p>
            <p className="text-2xl font-bold">
              ${(profitData?.slice(-7)?.reduce((acc, curr) => acc + curr.profit, 0) || 0).toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-background rounded-lg border">
            <p className="text-sm text-muted-foreground">Monthly Profit</p>
            <p className="text-2xl font-bold">
              ${(profitData?.slice(-30)?.reduce((acc, curr) => acc + curr.profit, 0) || 0).toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-background rounded-lg border">
            <p className="text-sm text-muted-foreground">Yearly Profit</p>
            <p className="text-2xl font-bold">
              ${(profitData?.reduce((acc, curr) => acc + curr.profit, 0) || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}