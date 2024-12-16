import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import type { CheckoutFormData } from "@/types/checkout";
import type { CartItem } from "@/types/cart";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cartItems = location.state?.cartItems as CartItem[];
  const isLocalCart = location.state?.isLocalCart as boolean;
  const isBuyNow = location.state?.isBuyNow as boolean;
  const fundraiserId = location.state?.fundraiserId as string;
  const variationId = location.state?.variationId as string;

  if (!cartItems || cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Starting checkout process...', { cartItems, fundraiserId, variationId });
      
      // Calculate order totals
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
      const shippingCost = 8.00;
      const taxRate = 0.05;
      const taxAmount = subtotal * taxRate;
      const totalAmount = subtotal + shippingCost + taxAmount;

      console.log('Calculated totals:', { subtotal, shippingCost, taxAmount, totalAmount });

      // Create order in database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_email: data.email,
          shipping_address: {
            name: data.name,
            address: data.address,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode
          },
          product_name: cartItems[0].product_name,
          price: subtotal,
          shipping_cost: shippingCost,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          image_path: cartItems[0].image_path,
          first_name: data.name.split(' ')[0],
          last_name: data.name.split(' ').slice(1).join(' '),
          is_fundraiser: !!fundraiserId,
          status: 'received'
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw orderError;
      }

      console.log('Order created successfully:', orderData);

      // If this is a fundraiser order, create the fundraiser order record
      if (fundraiserId && variationId && orderData) {
        console.log('Creating fundraiser order record...');
        const donationPercentage = 0.22; // 22% donation
        const donationAmount = subtotal * donationPercentage;
        
        const { error: fundraiserOrderError } = await supabase
          .from('fundraiser_orders')
          .insert({
            fundraiser_id: fundraiserId,
            variation_id: variationId,
            order_id: orderData.id,
            amount: subtotal,
            donation_amount: donationAmount
          });

        if (fundraiserOrderError) {
          console.error('Error creating fundraiser order:', fundraiserOrderError);
          throw fundraiserOrderError;
        }
        
        console.log('Fundraiser order created successfully');
      }

      // Clear cart if not a "Buy Now" purchase
      if (!isBuyNow) {
        localStorage.removeItem('cartItems');
      }

      // Show success message and redirect
      toast({
        title: "Order placed successfully",
        description: "Thank you for your purchase!",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error in checkout process:', error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <CheckoutForm 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default Checkout;