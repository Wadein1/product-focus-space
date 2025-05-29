
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, Shield } from "lucide-react";
import { SecureAdminAuth } from "@/components/admin/SecureAdminAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { AnalyticsSection } from "@/components/admin/analytics/AnalyticsSection";
import { InventoryManagement } from "@/components/admin/inventory/InventoryManagement";
import { FundraiserManagement } from "@/components/admin/fundraiser/FundraiserManagement";
import { DashboardControls } from "@/components/admin/DashboardControls";
import { OrderDetailsDialog } from "@/components/admin/OrderDetailsDialog";
import { useOrders } from "@/hooks/useOrders";
import { useToast } from "@/hooks/use-toast";
import { Order } from "@/types/order";

const Dashboard = () => {
  const { isAuthenticated, isLoading, logout } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState('regular');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get orders using the filters
  const { orders, isLoading: ordersLoading, updateOrderStatus, deleteOrder } = useOrders(
    searchTerm,
    statusFilter,
    orderTypeFilter
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrder.mutateAsync(orderId);
      toast({
        title: "Order deleted",
        description: "Order has been successfully deleted",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete order",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Validating session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SecureAdminAuth />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="fundraisers">Fundraisers</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <div className="space-y-4">
              <DashboardControls
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                orderTypeFilter={orderTypeFilter}
                onOrderTypeFilterChange={setOrderTypeFilter}
              />
              {ordersLoading ? (
                <div className="text-center py-8">Loading orders...</div>
              ) : (
                <OrdersTable
                  orders={orders || []}
                  onViewDetails={handleViewDetails}
                  onDeleteOrder={handleDeleteOrder}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsSection />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryManagement />
          </TabsContent>

          <TabsContent value="fundraisers">
            <FundraiserManagement />
          </TabsContent>

          <TabsContent value="controls">
            <div className="text-center py-8">
              <p className="text-gray-500">System controls will be available here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {selectedOrder && (
        <OrderDetailsDialog
          order={selectedOrder}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onStatusUpdate={(orderId, newStatus) => {
            updateOrderStatus.mutate({ orderId, newStatus });
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
