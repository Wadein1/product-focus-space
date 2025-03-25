
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useImageUpload } from "@/hooks/useImageUpload";
import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/types/cart";

export const useProductActions = (
  productDetails: {
    imagePreview: string | null;
    teamName: string;
    teamLocation: string;
    selectedChainColor: string;
    quantity: number;
  }
) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { uploadImage, isUploading } = useImageUpload();
  
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateInput = () => {
    if (!productDetails.imagePreview && (!productDetails.teamName || !productDetails.teamLocation)) {
      toast({
        title: "Required fields missing",
        description: "Please either upload an image OR enter team name and location",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const addToCart = async () => {
    if (!validateInput()) return;
    
    try {
      setIsAddingToCart(true);
      const cartItem: CartItem = {
        id: crypto.randomUUID(),
        cart_id: crypto.randomUUID(),
        product_name: 'Custom Medallion',
        price: 49.99,
        quantity: productDetails.quantity,
        image_path: productDetails.imagePreview || undefined,
        chain_color: productDetails.selectedChainColor !== "Designers' Choice" ? productDetails.selectedChainColor : undefined,
        is_fundraiser: false,
        team_name: productDetails.teamName || undefined,
        team_location: productDetails.teamLocation || undefined
      };

      const existingCartJson = localStorage.getItem('cartItems');
      const existingCart = existingCartJson ? JSON.parse(existingCartJson) : [];
      const updatedCart = [...existingCart, cartItem];
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));

      toast({
        title: "Added to cart",
        description: "The item has been added to your cart",
      });

      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const buyNow = async () => {
    if (!validateInput()) return;
    
    try {
      setIsProcessing(true);

      let finalImageUrl = productDetails.imagePreview;
      if (productDetails.imagePreview?.startsWith('data:')) {
        try {
          finalImageUrl = await uploadImage(productDetails.imagePreview);
          console.log('Image uploaded successfully:', finalImageUrl);
        } catch (error) {
          console.error('Failed to upload image:', error);
          throw new Error('Failed to upload image');
        }
      }

      const designType = finalImageUrl ? 'custom_upload' : 'team_logo';
      
      const metadata = {
        order_type: 'custom_medallion',
        chain_color: productDetails.selectedChainColor,
        design_type: designType,
        brand: "Gimme Drip", // Add brand identifier
        ...(finalImageUrl && { image_url: finalImageUrl }),
        ...(productDetails.teamName && { team_name: productDetails.teamName }),
        ...(productDetails.teamLocation && { team_location: productDetails.teamLocation }),
      };

      console.log('Sending metadata to Stripe:', metadata);

      const { data: checkoutData, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: [{
            product_name: 'Custom Medallion',
            price: 49.99,
            quantity: productDetails.quantity,
            image_path: finalImageUrl,
            chain_color: productDetails.selectedChainColor,
            is_fundraiser: false,
            team_name: productDetails.teamName || undefined,
            team_location: productDetails.teamLocation || undefined
          }],
          shipping_cost: 8.00, // Always add $8 shipping for direct purchases
          metadata
        },
      });

      if (error) {
        console.error('Checkout error:', error);
        throw error;
      }

      if (!checkoutData?.url) {
        throw new Error('No checkout URL received from Stripe');
      }

      window.location.href = checkoutData.url;
    } catch (error) {
      console.error('Error processing checkout:', error);
      toast({
        title: "Error",
        description: "Failed to process checkout",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isAddingToCart,
    isProcessing,
    isUploading,
    addToCart,
    buyNow,
  };
};
