import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trash2, MinusIcon, PlusIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Cart = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['cartItems'],
    queryFn: async () => {
      try {
        // First get the most recent active cart
        const { data: carts, error: cartsError } = await supabase
          .from('shopping_carts')
          .select('id')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1);

        if (cartsError) {
          console.error('Error fetching cart:', cartsError);
          return [];
        }

        // If no active cart exists, return empty array
        if (!carts || carts.length === 0) {
          return [];
        }

        // Get items from the cart
        const { data: items, error: itemsError } = await supabase
          .from('cart_items')
          .select('*')
          .eq('cart_id', carts[0].id);

        if (itemsError) {
          console.error('Error fetching cart items:', itemsError);
          return [];
        }

        return items || [];
      } catch (error) {
        console.error('Unexpected error in cartItems query:', error);
        return [];
      }
    },
    refetchInterval: 60000,
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
      toast({
        title: "Item removed",
        description: "The item has been removed from your cart",
      });
    },
    onError: (error) => {
      console.error('Error removing item:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
    },
    onError: (error) => {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: "Failed to update item quantity",
        variant: "destructive",
      });
    },
  });

  const handleQuantityChange = (itemId: string, currentQuantity: number, increment: boolean) => {
    const newQuantity = increment ? currentQuantity + 1 : Math.max(1, currentQuantity - 1);
    updateQuantityMutation.mutate({ itemId, quantity: newQuantity });
  };

  const handleRemoveItem = (itemId: string) => {
    removeItemMutation.mutate(itemId);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center">Loading cart...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        
        {cartItems && cartItems.length > 0 ? (
          <div className="space-y-8">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                {item.image_path && (
                  <img 
                    src={item.image_path} 
                    alt={item.product_name}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{item.product_name}</h3>
                  <p className="text-gray-600">${item.price}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(item.id, item.quantity || 1, false)}
                      disabled={item.quantity <= 1}
                    >
                      <MinusIcon className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center">{item.quantity || 1}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(item.id, item.quantity || 1, true)}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveItem(item.id)}
                  className="flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <div className="border-t pt-4">
              <div className="flex justify-between mb-4">
                <span>Subtotal</span>
                <span>${cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0).toFixed(2)}</span>
              </div>
              <Button 
                onClick={handleCheckout}
                className="w-full bg-primary text-white"
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
            <Button 
              onClick={() => navigate('/product')}
              variant="outline"
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;