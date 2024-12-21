import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import type { CartItem } from "@/types/cart";

export const useStripeCheckout = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const uploadImageToStorage = async (dataUrl: string): Promise<string> => {
    try {
      // Convert data URL to Blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Generate a unique filename
      const filename = `${uuidv4()}.${blob.type.split('/')[1]}`;
      const filePath = `product-images/${filename}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const createCheckoutSession = async (items: CartItem[]) => {
    setIsProcessing(true);
    try {
      // Process items and handle image URLs in parallel
      const processedItems = await Promise.all(items.map(async (item) => {
        let imageUrl = item.image_path;

        // If it's a data URL, upload it to storage
        if (imageUrl?.startsWith('data:')) {
          try {
            imageUrl = await uploadImageToStorage(imageUrl);
          } catch (error) {
            console.error('Failed to upload image:', error);
            imageUrl = undefined; // Skip image if upload fails
          }
        }

        return {
          ...item,
          image_path: imageUrl
        };
      }));

      const { data: checkoutData, error } = await supabase.functions.invoke('create-checkout', {
        body: { items: processedItems },
      });

      if (error) throw error;

      if (!checkoutData?.url) {
        throw new Error('No checkout URL received from Stripe');
      }

      window.location.href = checkoutData.url;
    } catch (error) {
      console.error('Checkout error:', error);
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