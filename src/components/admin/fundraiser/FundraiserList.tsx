import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, ShoppingCart } from "lucide-react";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import type { CartItem } from "@/types/cart";

export const FundraiserList = ({ onEdit }: { onEdit: (id: string) => void }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: fundraisers, isLoading } = useQuery({
    queryKey: ['fundraisers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fundraisers')
        .select(`
          *,
          fundraiser_variations (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      setDeletingId(id);
      setIsDeleting(true);

      // First delete all variations
      const { error: variationsError } = await supabase
        .from('fundraiser_variations')
        .delete()
        .eq('fundraiser_id', id);

      if (variationsError) throw variationsError;

      // Then delete the fundraiser
      const { error: fundraiserError } = await supabase
        .from('fundraisers')
        .delete()
        .eq('id', id);

      if (fundraiserError) throw fundraiserError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fundraisers'] });
      toast({
        title: "Success",
        description: "Fundraiser deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Error deleting fundraiser:', error);
      toast({
        title: "Error",
        description: "Failed to delete fundraiser",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsDeleting(false);
      setDeletingId(null);
    },
  });

  const addToCart = (fundraiser: any) => {
    try {
      const defaultVariation = fundraiser.fundraiser_variations?.find((v: any) => v.is_default);
      
      if (!defaultVariation) {
        toast({
          title: "Error",
          description: "No default variation found for this fundraiser",
          variant: "destructive",
        });
        return;
      }

      const cartItem: CartItem = {
        id: crypto.randomUUID(),
        cart_id: crypto.randomUUID(),
        product_name: `${fundraiser.title} - ${defaultVariation.title}`,
        price: fundraiser.base_price,
        quantity: 1,
        image_path: defaultVariation.image_path,
      };

      const existingCartJson = localStorage.getItem('cartItems');
      const existingCart = existingCartJson ? JSON.parse(existingCartJson) : [];
      const updatedCart = [...existingCart, cartItem];
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));

      toast({
        title: "Added to cart",
        description: "The fundraiser item has been added to your cart",
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading fundraisers...</div>;
  }

  return (
    <div className="space-y-4">
      <LoadingOverlay show={isDeleting} message="Deleting fundraiser..." />
      
      {fundraisers?.map((fundraiser) => (
        <div
          key={fundraiser.id}
          className="p-4 border rounded-lg flex items-center justify-between"
        >
          <div>
            <h3 className="font-semibold">{fundraiser.title}</h3>
            <p className="text-sm text-gray-600">
              Status: {fundraiser.status}
            </p>
            <p className="text-sm text-gray-600">
              Base Price: ${fundraiser.base_price}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => addToCart(fundraiser)}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(fundraiser.id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => deleteMutation.mutate(fundraiser.id)}
              disabled={isDeleting && deletingId === fundraiser.id}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};