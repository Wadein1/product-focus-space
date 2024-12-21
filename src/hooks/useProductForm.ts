import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/types/cart";

export const useProductForm = () => {
  const { toast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedChainColor, setSelectedChainColor] = useState<string>("");

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
            quantity
          )
        `)
        .eq('name', 'Chains')
        .single();

      if (error) throw error;
      
      const availableVariations = data?.inventory_variations.filter(
        variation => variation.quantity > 0
      ) || [];
      
      return availableVariations;
    },
  });

  useEffect(() => {
    if (chainColors?.length > 0 && !selectedChainColor) {
      setSelectedChainColor(chainColors[0].name);
    }
  }, [chainColors]);

  const validateForm = () => {
    if (!imagePreview) {
      toast({
        title: "Image required",
        description: "Please upload an image before proceeding",
        variant: "destructive",
      });
      return false;
    }
    if (!selectedChainColor) {
      toast({
        title: "Chain color required",
        description: "Please select a chain color",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const uploadImageToStorage = async (dataUrl: string): Promise<string> => {
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const filename = `${uuidv4()}.${blob.type.split('/')[1]}`;
      const filePath = `product-images/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

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

  const addToCart = async () => {
    if (!validateForm()) return;

    setIsAddingToCart(true);
    try {
      let imageUrl = imagePreview;
      
      if (imagePreview?.startsWith('data:')) {
        imageUrl = await uploadImageToStorage(imagePreview);
      }

      const newItem: CartItem = {
        id: uuidv4(),
        cart_id: uuidv4(),
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

    setIsProcessing(true);
    try {
      let imageUrl = imagePreview;
      
      if (imagePreview?.startsWith('data:')) {
        imageUrl = await uploadImageToStorage(imagePreview);
      }

      const { data: checkoutData, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: [{
            product_name: `Custom Medallion (${selectedChainColor})`,
            price: 49.99,
            quantity: quantity,
            image_path: imageUrl,
            chain_color: selectedChainColor
          }],
        },
      });

      if (error) throw error;

      if (!checkoutData?.url) {
        throw new Error('No checkout URL received from Stripe');
      }

      window.location.href = checkoutData.url;
    } catch (error) {
      console.error('Buy now failed:', error);
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
    quantity,
    imagePreview,
    chainColors,
    selectedChainColor,
    setSelectedChainColor,
    handleQuantityChange,
    handleFileChange,
    addToCart,
    buyNow
  };
};