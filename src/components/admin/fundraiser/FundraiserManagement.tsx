import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FundraiserForm } from './FundraiserForm';
import { FundraiserList } from './FundraiserList';
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

export const FundraiserManagement = () => {
  const { toast } = useToast();
  const [isClearing, setIsClearing] = useState(false);

  const clearUnusedImages = async () => {
    setIsClearing(true);
    try {
      // Get all files from storage
      const { data: storageFiles } = await supabase
        .storage
        .from('gallery')
        .list();

      if (!storageFiles) {
        throw new Error('Failed to fetch storage files');
      }

      // Get all image paths from fundraiser variations and variation images
      const { data: variations } = await supabase
        .from('fundraiser_variations')
        .select('image_path');

      const { data: variationImages } = await supabase
        .from('fundraiser_variation_images')
        .select('image_path');

      if (!variations || !variationImages) {
        throw new Error('Failed to fetch image paths');
      }

      // Create a set of used image paths
      const usedPaths = new Set([
        ...variations.map(v => v.image_path).filter(Boolean),
        ...variationImages.map(vi => vi.image_path).filter(Boolean)
      ]);

      // Find unused files
      const unusedFiles = storageFiles.filter(file => !usedPaths.has(file.name));

      // Delete unused files
      for (const file of unusedFiles) {
        const { error } = await supabase
          .storage
          .from('gallery')
          .remove([file.name]);
        
        if (error) {
          console.error('Error deleting file:', file.name, error);
        }
      }

      toast({
        title: "Cache cleared",
        description: `Successfully removed ${unusedFiles.length} unused files.`
      });
    } catch (error: any) {
      console.error('Error clearing cache:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to clear cache",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      <Tabs defaultValue="list" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="list">Fundraisers</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>
          <Button
            variant="outline"
            size="sm"
            onClick={clearUnusedImages}
            disabled={isClearing}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Cache
          </Button>
        </div>

        <TabsContent value="list">
          <FundraiserList />
        </TabsContent>

        <TabsContent value="create">
          <div className="max-w-2xl mx-auto">
            <FundraiserForm />
          </div>
        </TabsContent>
      </Tabs>
      <LoadingOverlay show={isClearing} message="Clearing unused images..." />
    </>
  );
};