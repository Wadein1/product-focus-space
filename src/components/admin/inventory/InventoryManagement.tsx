import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryManagement } from './CategoryManagement';
import { ItemManagement } from './ItemManagement';

export const InventoryManagement = () => {
  return (
    <Tabs defaultValue="items" className="w-full">
      <TabsList>
        <TabsTrigger value="items">Items</TabsTrigger>
        <TabsTrigger value="categories">Categories</TabsTrigger>
      </TabsList>
      
      <TabsContent value="items">
        <ItemManagement />
      </TabsContent>
      
      <TabsContent value="categories">
        <CategoryManagement />
      </TabsContent>
    </Tabs>
  );
};