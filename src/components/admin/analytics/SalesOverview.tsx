import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SalesOverviewProps {
  analytics: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  } | undefined;
}

export function SalesOverview({ analytics }: SalesOverviewProps) {
  return (
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
  );
}