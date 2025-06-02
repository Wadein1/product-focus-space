
import React from 'react';
import { AdminAuth } from "@/components/admin/AdminAuth";
import { StripeKeyManagement } from "@/components/admin/stripe/StripeKeyManagement";

const StripeManagement = () => {
  const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';

  if (!isAuthenticated) {
    return <AdminAuth />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Stripe Management</h1>
          <p className="text-gray-600">Manage Stripe API keys and switch between live and test modes</p>
        </div>
        
        <StripeKeyManagement />
      </div>
    </div>
  );
};

export default StripeManagement;
