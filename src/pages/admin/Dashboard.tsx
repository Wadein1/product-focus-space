import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from '@/types/order';
import { OrderDetailsDialog } from '@/components/admin/OrderDetailsDialog';
import { OrdersTable } from '@/components/admin/OrdersTable';
import { AdminAuth } from '@/components/admin/AdminAuth';
import { DashboardControls } from '@/components/admin/DashboardControls';
import { AnalyticsSection } from '@/components/admin/analytics/AnalyticsSection';
import { FundraiserManagement } from '@/components/admin/fundraiser/FundraiserManagement';
import { InventoryManagement } from '@/components/admin/inventory/InventoryManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStripeOrders } from '@/hooks/useStripeOrders';
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState("regular");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = () => {
      const adminAuth = sessionStorage.getItem('adminAuthenticated');
      setIsAuthenticated(!!adminAuth);
    };
    checkAuth();
  }, []);

  const { orders, isLoading, updateOrderStatus } = useStripeOrders(searchTerm, statusFilter, orderTypeFilter);

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
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
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
                orderTypeFilter={orderTypeFilter}
                onOrderTypeFilterChange={setOrderTypeFilter}
              />
            </CardHeader>
            <CardContent>
              <OrdersTable 
                orders={orders || []} 
                onViewDetails={setSelectedOrder}
                onDeleteOrder={() => {
                  toast({
                    title: "Cannot delete Stripe orders",
                    description: "Orders in Stripe cannot be deleted.",
                    variant: "destructive",
                  });
                }}
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

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
            </CardHeader>
            <CardContent>
              <InventoryManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;