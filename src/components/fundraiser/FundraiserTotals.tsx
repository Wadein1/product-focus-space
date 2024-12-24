import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFundraiserTotals } from "@/hooks/useFundraiserTotals";
import { Skeleton } from "@/components/ui/skeleton";

interface FundraiserTotalsProps {
  fundraiserId: string;
}

export function FundraiserTotals({ fundraiserId }: FundraiserTotalsProps) {
  const { data: totals, isLoading } = useFundraiserTotals(fundraiserId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fundraiser Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get the first row from the results array
  const totalsData = totals?.[0] || {
    total_raised: 0,
    total_orders: 0,
    total_items_sold: 0
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fundraiser Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-background rounded-lg border">
            <p className="text-sm text-muted-foreground">Total Raised</p>
            <p className="text-2xl font-bold">
              ${totalsData.total_raised.toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-background rounded-lg border">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold">
              {totalsData.total_orders}
            </p>
          </div>
          <div className="p-4 bg-background rounded-lg border">
            <p className="text-sm text-muted-foreground">Items Sold</p>
            <p className="text-2xl font-bold">
              {totalsData.total_items_sold}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}