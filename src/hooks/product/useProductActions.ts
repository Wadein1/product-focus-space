
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCheckout } from "@/hooks/useCheckout";
import type { CartItem } from "@/types/cart";

interface UseProductActionsParams {
  imagePreview: string | null;
  teamName: string;
  teamLocation: string;
  quantity: number;
  selectedChainColor: string;
}

export const useProductActions = ({
  imagePreview,
  teamName,
  teamLocation,
  quantity,
  selectedChainColor
}: UseProductActionsParams) => {
  const { toast } = useToast();
  const { createCheckoutSession, isProcessing } = useCheckout();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const createOrderItem = (chainColor: string) => {
    const hasImage = !!imagePreview;
    const hasTeamInfo = !!(teamName && teamLocation);
    
    // Allow ordering if either image is uploaded OR both team name and location are provided
    if (!hasImage && !hasTeamInfo) {
      throw new Error("Please upload an image or enter team information");
    }

    return {
      product_name: "Custom Medallion",
      price: 49.99,
      quantity,
      image_path: imagePreview,
      chain_color: chainColor,
      team_name: teamName || undefined,
      team_location: teamLocation || undefined,
    };
  };

  const handleBuyNow = async (chainColor: string = selectedChainColor) => {
    try {
      const item = createOrderItem(chainColor);
      await createCheckoutSession(item);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Please complete your order details",
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = async (chainColor: string = selectedChainColor) => {
    try {
      setIsAddingToCart(true);
      const orderItem = createOrderItem(chainColor);
      
      const cartItem: CartItem = {
        id: crypto.randomUUID(),
        ...orderItem
      };

      const existingCartJson = localStorage.getItem('cartItems');
      const existingCart = existingCartJson ? JSON.parse(existingCartJson) : [];
      const updatedCart = [...existingCart, cartItem];
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));

      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Please complete your order details",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  return {
    handleBuyNow,
    handleAddToCart,
    isAddingToCart,
    isProcessing,
  };
};
