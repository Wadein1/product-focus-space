import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useProductForm = () => {
  const { toast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedChainColor, setSelectedChainColor] = useState<string>("");

  const uploadImageToStorage = async (dataUrl: string): Promise<string> => {
    try {
      console.log('Starting image upload...');
      
      // Convert data URL to Blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Generate a unique filename
      const filename = `${uuidv4()}.${blob.type.split('/')[1]}`;
      const filePath = `product-images/${filename}`;

      console.log('Uploading to path:', filePath);

      // Upload to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('gallery')
        .upload(filePath, blob, {
          contentType: blob.type,
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      console.log('Upload successful, public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
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
    if (!validateForm()) return;

    setIsAddingToCart(true);
    try {
      let imageUrl = imagePreview;
      
      if (imagePreview?.startsWith('data:')) {
        try {
          imageUrl = await uploadImageToStorage(imagePreview);
        } catch (error) {
          console.error('Failed to upload image:', error);
          toast({
            title: "Error",
            description: "Failed to upload image. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }

      const newItem = {
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
        try {
          imageUrl = await uploadImageToStorage(imagePreview);
        } catch (error) {
          console.error('Failed to upload image:', error);
          toast({
            title: "Error",
            description: "Failed to upload image. Please try again.",
            variant: "destructive",
          });
          return;
        }
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
          customerEmail: null,
          shippingAddress: null,
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
    } catch (error: any) {
      console.error('Buy now error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create checkout session. Please try again.",
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
    chainColors: [], // This will be populated by the query in Product.tsx
    selectedChainColor,
    setSelectedChainColor,
    handleQuantityChange,
    handleFileChange,
    addToCart,
    buyNow
  };
};