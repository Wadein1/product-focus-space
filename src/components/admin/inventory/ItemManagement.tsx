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
import { Trash, Plus, Package } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VariationDialog } from './VariationDialog';

interface Category {
  id: string;
  name: string;
}

interface Item {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  par_level: number;
  inventory_categories?: {
    name: string;
  };
}

interface NewItem {
  name: string;
  description: string;
  category_id: string;
  par_level: number;
}

export const ItemManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
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
      return data as Item[];
    },
  });

  const addItem = useMutation({
    mutationFn: async (item: NewItem) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert([item])
        .select(`
          *,
          inventory_categories (
            name
          )
        `)
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Par Level</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items?.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.inventory_categories?.name}</TableCell>
              <TableCell>{item.par_level}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedItem(item)}
                  >
                    <Package className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteItem.mutate(item.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <VariationDialog
        item={selectedItem}
        onOpenChange={() => setSelectedItem(null)}
      />
    </div>
  );
};