import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/types/cart";

export const useProductForm = () => {
  const { toast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedChainColor, setSelectedChainColor] = useState<string>("");

  // Fetch chain colors from inventory with quantity > 0
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
      
      // Filter out variations with zero quantity
      const availableVariations = data?.inventory_variations.filter(
        variation => variation.quantity > 0
      ) || [];
      
      return availableVariations;
    },
  });

  // Set the first available chain color as default when data is loaded
  useEffect(() => {
    if (chainColors?.length > 0 && !selectedChainColor) {
      setSelectedChainColor(chainColors[0].name);
    }
  }, [chainColors]);

  const validateImage = () => {
    if (!imagePreview) {
      toast({
        title: "Image required",
        description: "Please upload an image before adding to cart",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateChainColor = () => {
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
    if (!validateImage() || !validateChainColor()) return;

    setIsAddingToCart(true);
    try {
      const newItem: CartItem = {
        id: uuidv4(),
        cart_id: uuidv4(),
        product_name: `Custom Medallion (${selectedChainColor})`,
        price: 49.99,
        quantity: quantity,
        image_path: imagePreview || "/lovable-uploads/c3b67733-225f-4e30-9363-e13d20ed3100.png",
        chain_color: selectedChainColor // Add chain color to cart item
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
    if (!validateImage() || !validateChainColor()) return;

    try {
      const item = {
        product_name: `Custom Medallion (${selectedChainColor})`,
        price: 49.99,
        quantity: quantity,
        image_path: imagePreview || "/lovable-uploads/c3b67733-225f-4e30-9363-e13d20ed3100.png",
        chain_color: selectedChainColor // Add chain color to metadata
      };

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
      console.error('Error processing buy now:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process purchase",
        variant: "destructive",
      });
    }
  };

  return {
    isAddingToCart,
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