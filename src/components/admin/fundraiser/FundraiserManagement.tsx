import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FundraiserForm } from './FundraiserForm';
import { FundraiserList } from './FundraiserList';

export const FundraiserManagement = () => {
  return (
    <Tabs defaultValue="list" className="space-y-4">
      <TabsList>
        <TabsTrigger value="list">Fundraisers</TabsTrigger>
        <TabsTrigger value="create">Create New</TabsTrigger>
      </TabsList>

      <TabsContent value="list">
        <FundraiserList />
      </TabsContent>

      <TabsContent value="create">
        <div className="max-w-2xl mx-auto">
          <FundraiserForm />
        </div>
      </TabsContent>
    </Tabs>
  );
};