import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/types/cart";

export const useStripeCheckout = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const createCheckoutSession = async (items: CartItem[]) => {
    setIsProcessing(true);
    try {
      const { data: checkoutData, error } = await supabase.functions.invoke('create-checkout', {
        body: { items },
      });

      if (error) throw error;

      if (!checkoutData?.url) {
        throw new Error('No checkout URL received from Stripe');
      }

      window.location.href = checkoutData.url;
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    createCheckoutSession,
    isProcessing
  };
};