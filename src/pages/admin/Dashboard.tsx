import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from '@/types/order';
import { OrderDetailsDialog } from '@/components/admin/OrderDetailsDialog';
import { OrdersTable } from '@/components/admin/OrdersTable';
import { AdminAuth } from '@/components/admin/AdminAuth';
import { DashboardControls } from '@/components/admin/DashboardControls';
import { AnalyticsSection } from '@/components/admin/analytics/AnalyticsSection';
import { FundraiserManagement } from '@/components/admin/fundraiser/FundraiserManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrders } from '@/hooks/useOrders';
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = () => {
      const adminAuth = sessionStorage.getItem('adminAuthenticated');
      setIsAuthenticated(!!adminAuth);
    };
    checkAuth();
  }, []);

  const { orders, isLoading, updateOrderStatus, deleteOrder } = useOrders(searchTerm, statusFilter);

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrder.mutateAsync(orderId);
      toast({
        title: "Order deleted",
        description: "The order has been successfully deleted.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error deleting order",
        description: "There was an error deleting the order. Please try again.",
      });
    }
  };

  if (!isAuthenticated) {
    return <AdminAuth />;
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="fundraisers">Fundraisers</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
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
                onDeleteOrder={handleDeleteOrder}
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
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsSection />
        </TabsContent>

        <TabsContent value="fundraisers">
          <Card>
            <CardHeader>
              <CardTitle>Fundraiser Management</CardTitle>
            </CardHeader>
            <CardContent>
              <FundraiserManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;