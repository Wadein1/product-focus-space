
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminAuth } from '@/components/admin/AdminAuth';
import { FundraiserManagement } from '@/components/admin/fundraiser/FundraiserManagement';
import { InventoryManagement } from '@/components/admin/inventory/InventoryManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { CreditCard } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'team' | 'regular';
  }>({ isOpen: false, type: 'team' });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = () => {
      const adminAuth = sessionStorage.getItem('adminAuthenticated');
      setIsAuthenticated(!!adminAuth);
    };
    checkAuth();
  }, []);

  const handleUniversalToggle = (type: 'team' | 'regular') => {
    setConfirmDialog({
      isOpen: true,
      type
    });
  };

  const confirmUniversalToggle = async () => {
    const { type } = confirmDialog;
    const field = type === 'team' ? 'allow_team_shipping' : 'allow_regular_shipping';
    
    try {
      // First get current state to toggle
      const { data: currentData } = await supabase
        .from('fundraisers')
        .select(field)
        .limit(1)
        .single();
      
      const currentValue = currentData?.[field] ?? true;
      const newValue = !currentValue;
      
      const { error } = await supabase
        .from('fundraisers')
        .update({ [field]: newValue })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

      if (error) throw error;

      toast({
        title: "Success",
        description: `${type === 'team' ? 'Team' : 'Regular'} shipping ${newValue ? 'enabled' : 'disabled'} for all fundraisers`,
      });
      
    } catch (error) {
      console.error('Error updating shipping:', error);
      toast({
        title: "Error",
        description: "Failed to update shipping for all fundraisers",
        variant: "destructive",
      });
    } finally {
      setConfirmDialog({ isOpen: false, type: 'team' });
    }
  };

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
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="fundraisers">Fundraisers</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => handleUniversalToggle('team')}
              variant="outline"
              size="sm"
            >
              Toggle Team Shipping
            </Button>
            <Button 
              onClick={() => handleUniversalToggle('regular')}
              variant="outline" 
              size="sm"
            >
              Toggle Regular Shipping
            </Button>
          </div>
        </div>

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

      <AlertDialog 
        open={confirmDialog.isOpen} 
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, isOpen: open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Universal Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to toggle {confirmDialog.type === 'team' ? 'team shipping' : 'regular shipping'} for ALL fundraisers? 
              This action will affect all existing fundraisers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUniversalToggle}>
              Toggle for All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
