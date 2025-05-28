
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { SecurityDashboard } from '@/components/security/SecurityDashboard';
import { SecurityEducation } from '@/components/security/SecurityEducation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Security = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <Tabs defaultValue="dashboard" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="dashboard">Security Status</TabsTrigger>
              <TabsTrigger value="education">Security Guide</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="dashboard">
            <SecurityDashboard />
          </TabsContent>
          
          <TabsContent value="education">
            <SecurityEducation />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Security;
