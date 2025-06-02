import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ShieldCheck, PackageCheck, Users, LayoutDashboard } from "lucide-react";

export const DashboardControls = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => navigate('/admin/products')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <Sparkles className="w-6 h-6" />
              <span>Manage Products</span>
            </Button>
            <Button
              onClick={() => navigate('/admin/orders')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <ShieldCheck className="w-6 h-6" />
              <span>View Orders</span>
            </Button>
            <Button
              onClick={() => navigate('/admin/inventory')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <PackageCheck className="w-6 h-6" />
              <span>Manage Inventory</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>System Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => navigate('/admin/users')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <Users className="w-6 h-6" />
              <span>Manage Users</span>
            </Button>
            <Button
              onClick={() => navigate('/admin/dashboard')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <LayoutDashboard className="w-6 h-6" />
              <span>View Dashboard</span>
            </Button>
            
            <Button
              onClick={() => navigate('/admin/stripe-management')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <span className="text-lg">💳</span>
              <span>Stripe Management</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
