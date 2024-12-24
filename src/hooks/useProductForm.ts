import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useImageUpload } from "@/hooks/useImageUpload";
import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/types/cart";

export const useProductForm = () => {
  // Initialize all hooks at the top level
  const { toast } = useToast();
  const navigate = useNavigate();
  const { uploadImage, isUploading } = useImageUpload();
  
  // State hooks
  const [quantity, setQuantity] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedChainColor, setSelectedChainColor] = useState("Designers' Choice");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuantityChange = (increment: boolean) => {
    setQuantity(prev => increment ? prev + 1 : Math.max(1, prev - 1));
  };

  const handleFileChange = async (file: File) => {
    try {
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error handling file:', error);
      toast({
        title: "Error",
        description: "Failed to process the image",
        variant: "destructive",
      });
    }
  };

  const addToCart = async () => {
    try {
      setIsAddingToCart(true);
      const cartItem: CartItem = {
        id: crypto.randomUUID(),
        cart_id: crypto.randomUUID(),
        product_name: 'Custom Medallion',
        price: 49.99,
        quantity,
        image_path: imagePreview || undefined,
        chain_color: selectedChainColor !== "Designers' Choice" ? selectedChainColor : undefined,
        is_fundraiser: false
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
    try {
      setIsProcessing(true);
      const { data: checkoutData, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: [{
            product_name: 'Custom Medallion',
            price: 49.99,
            quantity,
            image_path: imagePreview,
            chain_color: selectedChainColor !== "Designers' Choice" ? selectedChainColor : undefined,
            is_fundraiser: false
          }],
        },
      });

      if (error) throw error;

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

  const chainColors = [
    { id: '1', name: "Designers' Choice" },
    { id: '2', name: 'Black' },
    { id: '3', name: 'White' },
    { id: '4', name: 'Red' },
    { id: '5', name: 'Blue' },
    { id: '6', name: 'Yellow' },
  ];

  return {
    quantity,
    imagePreview,
    chainColors,
    selectedChainColor,
    isAddingToCart,
    isProcessing,
    isUploading,
    setSelectedChainColor,
    handleQuantityChange,
    handleFileChange,
    addToCart,
    buyNow,
  };
};