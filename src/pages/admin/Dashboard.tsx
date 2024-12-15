import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from '@/types/order';
import { AdminAuth } from '@/components/admin/AdminAuth';
import { AnalyticsSection } from '@/components/admin/analytics/AnalyticsSection';
import { FundraiserManagement } from '@/components/admin/fundraiser/FundraiserManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrders } from '@/hooks/useOrders';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { OrdersTabContent } from '@/components/admin/OrdersTabContent';
import { LoadingSpinner } from '@/components/admin/LoadingSpinner';

const Dashboard = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { 
    orders, 
    totalCount, 
    isLoading: ordersLoading, 
    updateOrderStatus, 
    deleteOrder 
  } = useOrders(
    activeTab === "orders" ? searchTerm : "",
    activeTab === "orders" ? statusFilter : "all",
    currentPage
  );

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const { data: adminUser, error: adminError } = await supabase
          .from('admin_users')
          .select('email')
          .eq('email', session.user.email)
          .single();

        if (adminError || !adminUser) {
          toast({
            title: "Unauthorized",
            description: "You don't have permission to access this area.",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth error:', error);
        toast({
          title: "Authentication Error",
          description: "Please try logging in again.",
          variant: "destructive"
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        navigate('/');
      } else if (event === 'SIGNED_IN' && session) {
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('email')
          .eq('email', session.user.email)
          .single();

        if (!adminUser) {
          navigate('/');
        } else {
          setIsAuthenticated(true);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <AdminAuth />;
  }

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

  const totalPages = Math.ceil(totalCount / 20);

  return (
    <div className="container mx-auto p-6">
      <Tabs 
        defaultValue="orders" 
        className="space-y-4"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="fundraisers">Fundraisers</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          {activeTab === "orders" && (
            <OrdersTabContent
              orders={orders || []}
              totalPages={totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              selectedOrder={selectedOrder}
              setSelectedOrder={setSelectedOrder}
              onDeleteOrder={handleDeleteOrder}
              onStatusUpdate={(orderId, newStatus) => {
                updateOrderStatus.mutate({ orderId, newStatus });
              }}
              isLoading={ordersLoading}
            />
          )}
        </TabsContent>

        <TabsContent value="analytics">
          {activeTab === "analytics" && <AnalyticsSection />}
        </TabsContent>

        <TabsContent value="fundraisers">
          {activeTab === "fundraisers" && (
            <Card>
              <CardHeader>
                <CardTitle>Fundraiser Management</CardTitle>
              </CardHeader>
              <CardContent>
                <FundraiserManagement />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;