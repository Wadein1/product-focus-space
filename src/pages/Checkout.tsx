import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
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
      // This is now handled in the CheckoutForm component
      console.log('Proceeding to Stripe checkout...');
    } catch (error) {
      console.error('Error in checkout process:', error);
      toast({
        title: "Error",
        description: "Failed to process checkout. Please try again.",
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
          cartItems={cartItems}
        />
      </div>
    </div>
  );
};

export default Checkout;