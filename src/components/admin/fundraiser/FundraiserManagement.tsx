import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FundraiserForm } from './FundraiserForm';
import { FundraiserList } from './FundraiserList';
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { useQuery } from "@tanstack/react-query";
import type { Fundraiser } from './types';

export const FundraiserManagement = () => {
  const { toast } = useToast();
  const [isClearing, setIsClearing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: editingFundraiser } = useQuery({
    queryKey: ['fundraiser', editingId],
    queryFn: async () => {
      if (!editingId) return null;
      
      const { data, error } = await supabase
        .from('fundraisers')
        .select(`
          *,
          fundraiser_variations (*)
        `)
        .eq('id', editingId)
        .single();

      if (error) throw error;
      return data as Fundraiser;
    },
    enabled: !!editingId
  });

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

      // Get all image paths from fundraiser variations
      const { data: variations } = await supabase
        .from('fundraiser_variations')
        .select('image_path');

      if (!variations) {
        throw new Error('Failed to fetch variations');
      }

      // Create a set of used image paths
      const usedPaths = new Set(variations.map(v => v.image_path).filter(Boolean));

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

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleEditSuccess = () => {
    setEditingId(null);
  };

  return (
    <>
      <Tabs 
        defaultValue="list" 
        className="space-y-4"
        value={editingId ? "create" : undefined}
      >
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger 
              value="list"
              onClick={() => setEditingId(null)}
            >
              Fundraisers
            </TabsTrigger>
            <TabsTrigger 
              value="create"
              onClick={() => setEditingId(null)}
            >
              Create New
            </TabsTrigger>
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
          <FundraiserList onEdit={handleEdit} />
        </TabsContent>

        <TabsContent value="create">
          <div className="max-w-2xl mx-auto">
            <FundraiserForm 
              fundraiser={editingFundraiser}
              onSuccess={handleEditSuccess}
            />
          </div>
        </TabsContent>
      </Tabs>
      <LoadingOverlay show={isClearing} message="Clearing unused images..." />
    </>
  );
};