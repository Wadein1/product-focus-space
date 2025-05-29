import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminAuth } from '@/components/admin/AdminAuth';
import { FundraiserManagement } from '@/components/admin/fundraiser/FundraiserManagement';
import { InventoryManagement } from '@/components/admin/inventory/InventoryManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const adminAuth = sessionStorage.getItem('adminAuthenticated');
      setIsAuthenticated(!!adminAuth);
    };
    checkAuth();
  }, []);

  if (!isAuthenticated) {
    return <AdminAuth onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="fundraisers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="fundraisers">Fundraisers</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

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