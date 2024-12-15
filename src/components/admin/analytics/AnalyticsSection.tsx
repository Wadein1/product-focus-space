import React from 'react';
import { CostManagement } from "./CostManagement";
import { SalesOverview } from "./SalesOverview";
import { ProfitChart } from "./ProfitChart";
import { useAnalytics } from "./useAnalytics";

export function AnalyticsSection() {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();

  if (analyticsLoading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <CostManagement analytics={analytics} />
      <SalesOverview analytics={analytics} />
      <ProfitChart />
    </div>
  );
}