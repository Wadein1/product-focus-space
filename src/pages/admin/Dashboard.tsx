
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminAuth } from '@/components/admin/AdminAuth';
import { FundraiserManagement } from '@/components/admin/fundraiser/FundraiserManagement';
import { InventoryManagement } from '@/components/admin/inventory/InventoryManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { CreditCard } from "lucide-react";

const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

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
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button
            onClick={() => navigate('/admin/stripe-management')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Stripe Management
          </Button>
        </div>
      </div>

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
