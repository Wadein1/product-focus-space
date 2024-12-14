import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";

const Cart = () => {
  const navigate = useNavigate();

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ['cartItems'],
    queryFn: async () => {
      // First get active cart
      const { data: carts, error: cartError } = await supabase
        .from('shopping_carts')
        .select('id')
        .eq('status', 'active')
        .limit(1);

      if (cartError) throw cartError;

      // If no active cart exists, return empty array
      if (!carts || carts.length === 0) {
        return [];
      }

      // Get cart items for the active cart
      const { data: items, error: itemsError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', carts[0].id);

      if (itemsError) throw itemsError;
      return items || [];
    }
  });

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
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
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