import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VariationRow } from './components/VariationRow';

interface Item {
  id: string;
  name: string;
  par_level: number;
}

interface VariationDialogProps {
  item: Item | null;
  onOpenChange: () => void;
}

export const VariationDialog = ({ item, onOpenChange }: VariationDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newVariation, setNewVariation] = useState({
    name: '',
    quantity: 0,
    par_level: 0,
  });

  const { data: variations, isLoading } = useQuery({
    queryKey: ['inventory-variations', item?.id],
    queryFn: async () => {
      if (!item) return [];
      const { data, error } = await supabase
        .from('inventory_variations')
        .select('*')
        .eq('item_id', item.id)
        .order('order_index');
      
      if (error) throw error;
      return data;
    },
    enabled: !!item,
  });

  const addVariation = useMutation({
    mutationFn: async (variation: typeof newVariation) => {
      const maxOrderIndex = Math.max(...(variations?.map(v => v.order_index) || [-1]));
      const { data, error } = await supabase
        .from('inventory_variations')
        .insert([{ 
          ...variation, 
          item_id: item?.id,
          order_index: maxOrderIndex + 1
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-variations', item?.id] });
      setNewVariation({ name: '', quantity: 0, par_level: 0 });
      toast({
        title: "Variation added",
        description: "The variation has been successfully added.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add variation. Please try again.",
      });
    },
  });

  const updateVariation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('inventory_variations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-variations', item?.id] });
      toast({
        title: "Variation updated",
        description: "The variation has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update variation. Please try again.",
      });
    },
  });

  const deleteVariation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('inventory_variations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-variations', item?.id] });
      toast({
        title: "Variation deleted",
        description: "The variation has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete variation. Please try again.",
      });
    },
  });

  const handleDrop = async (draggedId: string, targetId: string) => {
    if (!variations) return;
    
    const draggedIndex = variations.findIndex(v => v.id === draggedId);
    const targetIndex = variations.findIndex(v => v.id === targetId);
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newVariations = [...variations];
    const [draggedItem] = newVariations.splice(draggedIndex, 1);
    newVariations.splice(targetIndex, 0, draggedItem);

    // Update order_index for all affected variations
    const updates = newVariations.map((variation, index) => ({
      id: variation.id,
      order_index: index,
    }));

    try {
      await Promise.all(
        updates.map(update =>
          supabase
            .from('inventory_variations')
            .update({ order_index: update.order_index })
            .eq('id', update.id)
        )
      );

      queryClient.invalidateQueries({ queryKey: ['inventory-variations', item?.id] });
      toast({
        title: "Order updated",
        description: "The variations have been reordered successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reorder variations. Please try again.",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !newVariation.name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Variation name is required.",
      });
      return;
    }
    addVariation.mutate(newVariation);
  };

  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Manage Variations - {item?.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Variation Name"
              value={newVariation.name}
              onChange={(e) => setNewVariation(prev => ({ ...prev, name: e.target.value }))}
            />
            <Input
              type="number"
              placeholder="Quantity"
              value={newVariation.quantity}
              onChange={(e) => setNewVariation(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
            />
            <Input
              type="number"
              placeholder="Par Level"
              value={newVariation.par_level}
              onChange={(e) => setNewVariation(prev => ({ ...prev, par_level: parseInt(e.target.value) || 0 }))}
            />
            <Button type="submit">
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </form>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {variations?.map((variation) => (
              <VariationRow
                key={variation.id}
                variation={variation}
                onDelete={deleteVariation.mutate}
                onUpdate={(id, updates) => updateVariation.mutate({ id, updates })}
                dragHandleProps={{
                  draggable: true,
                  onDragStart: (e: React.DragEvent) => {
                    e.dataTransfer.setData('text/plain', variation.id);
                  },
                  onDragOver: (e: React.DragEvent) => {
                    e.preventDefault();
                  },
                  onDrop: (e: React.DragEvent) => {
                    e.preventDefault();
                    const draggedId = e.dataTransfer.getData('text/plain');
                    handleDrop(draggedId, variation.id);
                  },
                }}
              />
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};