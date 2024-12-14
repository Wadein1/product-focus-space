import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from '@/types/admin';
import { OrderDetailsDialog } from '@/components/admin/OrderDetailsDialog';
import { OrdersTable } from '@/components/admin/OrdersTable';
import { AdminAuth } from '@/components/admin/AdminAuth';
import { DashboardControls } from '@/components/admin/DashboardControls';
import { useOrders } from '@/hooks/useOrders';

const Dashboard = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const adminAuth = sessionStorage.getItem('adminAuthenticated');
      setIsAuthenticated(!!adminAuth);
    };
    checkAuth();
  }, []);

  const { orders, isLoading, updateOrderStatus } = useOrders(searchTerm, statusFilter);

  if (!isAuthenticated) {
    return <AdminAuth />;
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Order Tracking</CardTitle>
          <DashboardControls
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </CardHeader>
        <CardContent>
          <OrdersTable 
            orders={orders || []} 
            onViewDetails={setSelectedOrder}
          />
        </CardContent>
      </Card>

      <OrderDetailsDialog
        order={selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
        onStatusUpdate={(orderId, newStatus) => {
          updateOrderStatus.mutate({ orderId, newStatus });
        }}
      />
    </div>
  );
};

export default Dashboard;