import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import type { CheckoutFormData } from "@/types/checkout";

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);
    try {
      // Get active cart
      const { data: cart } = await supabase
        .from('shopping_carts')
        .select('id')
        .eq('status', 'active')
        .single();

      if (!cart) {
        toast({
          title: "Cart not found",
          description: "Please add items to your cart first",
          variant: "destructive",
        });
        navigate('/cart');
        return;
      }

      // Get cart items
      const { data: cartItems } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cart.id);

      if (!cartItems?.length) {
        toast({
          title: "Cart is empty",
          description: "Please add items to your cart first",
          variant: "destructive",
        });
        navigate('/cart');
        return;
      }

      // Calculate totals
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
      const shippingCost = 8.00;
      const taxRate = 0.05;
      const taxAmount = subtotal * taxRate;
      const totalAmount = subtotal + shippingCost + taxAmount;

      // Create order
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_email: data.email,
          shipping_address: {
            name: data.name,
            address: data.address,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
          },
          cart_id: cart.id,
          product_name: cartItems[0].product_name,
          price: subtotal,
          shipping_cost: shippingCost,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          image_path: cartItems[0].image_path,
        });

      if (orderError) throw orderError;

      // Update cart status
      await supabase
        .from('shopping_carts')
        .update({ status: 'completed' })
        .eq('id', cart.id);

      toast({
        title: "Order placed successfully!",
        description: "You will receive a confirmation email shortly.",
      });

      navigate('/');
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error placing order",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          <CheckoutForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </div>
    </div>
  );
};

export default Checkout;