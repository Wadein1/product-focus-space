
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
    const hasCompleteTeamInfo = !!(teamName && teamLocation);
    
    console.log('Order validation check:', {
      hasImage,
      hasCompleteTeamInfo,
      imagePreview: !!imagePreview,
      teamName,
      teamLocation
    });
    
    // Allow ordering if either image is uploaded OR complete team info is provided
    if (!hasImage && !hasCompleteTeamInfo) {
      console.log('Validation failed: No image and no complete team info');
      throw new Error("Please upload an image or enter complete team information (both name and location)");
    }

    console.log('Validation passed, creating order item');

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
      console.log('handleBuyNow called with:', { chainColor, imagePreview: !!imagePreview, teamName, teamLocation });
      const item = createOrderItem(chainColor);
      console.log('Order item created successfully:', item);
      await createCheckoutSession(item);
    } catch (error: any) {
      console.error('Buy now error:', error);
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
      console.log('handleAddToCart called with:', { chainColor, imagePreview: !!imagePreview, teamName, teamLocation });
      const orderItem = createOrderItem(chainColor);
      console.log('Order item created successfully for cart:', orderItem);
      
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
      console.error('Add to cart error:', error);
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
