import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { VariationDialog } from './VariationDialog';
import { DeleteItemDialog } from './components/DeleteItemDialog';
import { ItemList } from './components/ItemList';

interface NewItem {
  name: string;
  description: string;
  category_id: string;
  par_level: number;
}

export const ItemManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const [newItem, setNewItem] = useState<NewItem>({
    name: '',
    description: '',
    category_id: '',
    par_level: 0,
  });

  const { data: categories } = useQuery({
    queryKey: ['inventory-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_categories')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: items, isLoading } = useQuery({
    queryKey: ['inventory-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          inventory_categories (
            name
          )
        `)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const addItem = useMutation({
    mutationFn: async (item: NewItem) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert([item])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      setNewItem({
        name: '',
        description: '',
        category_id: '',
        par_level: 0,
      });
      toast({
        title: "Item added",
        description: "The item has been successfully added.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add item. Please try again.",
      });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast({
        title: "Item deleted",
        description: "The item has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete item. Please try again.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim() || !newItem.category_id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Item name and category are required.",
      });
      return;
    }
    addItem.mutate(newItem);
  };

  if (isLoading) {
    return <div>Loading items...</div>;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="Item Name"
            value={newItem.name}
            onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
          />
          <Select
            value={newItem.category_id}
            onValueChange={(value) => setNewItem(prev => ({ ...prev, category_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Par Level"
            value={newItem.par_level}
            onChange={(e) => setNewItem(prev => ({ ...prev, par_level: parseInt(e.target.value) || 0 }))}
          />
          <Textarea
            placeholder="Description (optional)"
            value={newItem.description}
            onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>
        <Button type="submit" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </form>

      <ItemList 
        items={items || []}
        onViewDetails={setSelectedItem}
        onDeleteItem={setItemToDelete}
      />

      <VariationDialog
        item={selectedItem}
        onOpenChange={() => setSelectedItem(null)}
      />

      <DeleteItemDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) {
            deleteItem.mutate(itemToDelete.id);
            setItemToDelete(null);
          }
        }}
        itemName={itemToDelete?.name || ''}
        isLocked={itemToDelete?.is_locked}
        adminUsername="admin"
        adminPassword="thanksculvers"
      />
    </div>
  );
};