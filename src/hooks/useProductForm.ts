import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useImageUpload } from "./useImageUpload";
import { useStripeCheckout } from "./useStripeCheckout";
import type { CartItem } from "@/types/cart";

export const useProductForm = () => {
  const { toast } = useToast();
  const { uploadImage, isUploading, uploadProgress } = useImageUpload();
  const { createCheckoutSession, isProcessing } = useStripeCheckout();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedChainColor, setSelectedChainColor] = useState<string>("Designers' Choice");

  const { data: chainColors } = useQuery({
    queryKey: ['chain-colors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          id,
          inventory_variations (
            id,
            name,
            color,
            quantity,
            order_index
          )
        `)
        .eq('name', 'Chains')
        .single();

      if (error) throw error;
      
      const availableVariations = data?.inventory_variations
        .filter(variation => variation.quantity > 0)
        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0)) || [];
      
      return availableVariations;
    },
  });

  const handleQuantityChange = (increment: boolean) => {
    setQuantity(prev => increment ? prev + 1 : Math.max(1, prev - 1));
  };

  const handleFileChange = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    if (!imagePreview) {
      toast({
        title: "Image required",
        description: "Please upload an image before proceeding",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const addToCart = async () => {
    if (!validateForm()) return;

    setIsAddingToCart(true);
    try {
      let imageUrl = imagePreview;
      
      if (imagePreview?.startsWith('data:')) {
        imageUrl = await uploadImage(imagePreview);
      }

      const newItem: CartItem = {
        id: crypto.randomUUID(),
        cart_id: crypto.randomUUID(),
        product_name: `Custom Medallion (${selectedChainColor})`,
        price: 49.99,
        quantity: quantity,
        image_path: imageUrl,
        chain_color: selectedChainColor
      };

      const existingCartJson = localStorage.getItem('cartItems');
      const existingCart = existingCartJson ? JSON.parse(existingCartJson) : [];
      const updatedCart = [...existingCart, newItem];
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));

      toast({
        title: "Added to cart",
        description: "The item has been added to your cart",
      });
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
    if (!validateForm()) return;

    try {
      // Create the item first, using the data URL directly
      const item = {
        id: crypto.randomUUID(),
        cart_id: crypto.randomUUID(),
        product_name: `Custom Medallion (${selectedChainColor})`,
        price: 49.99,
        quantity: quantity,
        image_path: imagePreview, // Pass the data URL directly
        chain_color: selectedChainColor
      };

      // Start the checkout process immediately
      await createCheckoutSession([item]);
    } catch (error) {
      console.error('Buy now failed:', error);
      toast({
        title: "Error",
        description: "Failed to process checkout",
        variant: "destructive",
      });
    }
  };

  return {
    isAddingToCart,
    isProcessing: isProcessing || isUploading,
    quantity,
    imagePreview,
    chainColors,
    selectedChainColor,
    setSelectedChainColor,
    handleQuantityChange,
    handleFileChange,
    addToCart,
    buyNow,
    uploadProgress,
    isUploading
  };
};