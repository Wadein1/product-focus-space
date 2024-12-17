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
import { Trash, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Variation {
  id: string;
  item_id: string;
  name: string;
  color: string | null;
  quantity: number;
}

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
    color: '',
    quantity: 0,
  });

  const { data: variations, isLoading } = useQuery({
    queryKey: ['inventory-variations', item?.id],
    queryFn: async () => {
      if (!item) return [];
      const { data, error } = await supabase
        .from('inventory_variations')
        .select('*')
        .eq('item_id', item.id)
        .order('name');
      
      if (error) throw error;
      return data as Variation[];
    },
    enabled: !!item,
  });

  const addVariation = useMutation({
    mutationFn: async (variation: Omit<Variation, 'id'>) => {
      const { data, error } = await supabase
        .from('inventory_variations')
        .insert([variation])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-variations', item?.id] });
      setNewVariation({ name: '', color: '', quantity: 0 });
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
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { data, error } = await supabase
        .from('inventory_variations')
        .update({ quantity })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-variations', item?.id] });
      toast({
        title: "Quantity updated",
        description: "The quantity has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update quantity. Please try again.",
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
    addVariation.mutate({
      ...newVariation,
      item_id: item.id,
    });
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
              placeholder="Color (optional)"
              value={newVariation.color}
              onChange={(e) => setNewVariation(prev => ({ ...prev, color: e.target.value }))}
            />
            <Input
              type="number"
              placeholder="Quantity"
              value={newVariation.quantity}
              onChange={(e) => setNewVariation(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
            />
            <Button type="submit">
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variations?.map((variation) => (
              <TableRow key={variation.id}>
                <TableCell>{variation.name}</TableCell>
                <TableCell>{variation.color}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={variation.quantity}
                      onChange={(e) => {
                        const newQuantity = parseInt(e.target.value) || 0;
                        updateVariation.mutate({
                          id: variation.id,
                          quantity: newQuantity,
                        });
                      }}
                      className="w-24"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteVariation.mutate(variation.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};