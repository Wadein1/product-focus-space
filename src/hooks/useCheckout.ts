
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
    team_name?: string;
    team_location?: string;
  }) => {
    setIsProcessing(true);
    try {
      // Always add $5 shipping for Custom Medallion
      const shippingCost = item.product_name === 'Custom Medallion' ? 5.00 : 0;

      const { data: checkoutData, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: [item],
          customerEmail: null,
          shippingAddress: null,
          shipping_cost: shippingCost,
          metadata: {
            image_path: item.image_path || '',
            chain_color: item.chain_color || '',
            team_name: item.team_name || '',
            team_location: item.team_location || ''
          },
        },
      });

      if (error) {
        throw error;
      }

      if (!checkoutData?.url) {
        throw new Error('No checkout URL received from Stripe');
      }

      window.location.href = checkoutData.url;
    } catch (error: any) {
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
