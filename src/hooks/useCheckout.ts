import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useCheckout = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const createCheckoutSession = async (item: {
    product_name: string;
    price: number;
    quantity: number;
    image_path?: string;
    chain_color?: string;
  }) => {
    setIsProcessing(true);
    try {
      console.log('Creating checkout session with item:', item);

      const { data: checkoutData, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: [item],
          customerEmail: null,
          shippingAddress: null,
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!checkoutData?.url) {
        console.error('No checkout URL received:', checkoutData);
        throw new Error('No checkout URL received from Stripe');
      }

      window.location.href = checkoutData.url;
    } catch (error: any) {
      console.error('Error processing checkout:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process checkout",
        variant: "destructive",
      });
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