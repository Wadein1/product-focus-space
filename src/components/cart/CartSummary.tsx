import { Button } from "@/components/ui/button";
import { CartItem as CartItemType } from "@/types/cart";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

interface CartSummaryProps {
  items: CartItemType[];
}

export const CartSummary = ({ items }: CartSummaryProps) => {
  const { toast } = useToast();
  const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const shippingCost = 0;
  const taxRate = 0.05;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + shippingCost + taxAmount;

  const uploadImageToStorage = async (dataUrl: string): Promise<string> => {
    try {
      // Convert to blob with optimized size
      const response = await fetch(dataUrl);
      const originalBlob = await response.blob();
      
      // Compress image if it's too large (over 1MB)
      let blob = originalBlob;
      if (originalBlob.size > 1024 * 1024) {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = dataUrl;
        });

        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        const maxDimension = 1200;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with reduced quality
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        const base64Response = await fetch(compressedDataUrl);
        blob = await base64Response.blob();
      }

      const filename = `${uuidv4()}.${blob.type.split('/')[1]}`;
      const filePath = `product-images/${filename}`;

      // Use chunk upload for large files
      if (blob.size > 5 * 1024 * 1024) {
        const chunkSize = 5 * 1024 * 1024; // 5MB chunks
        const chunks = Math.ceil(blob.size / chunkSize);
        
        for (let i = 0; i < chunks; i++) {
          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, blob.size);
          const chunk = blob.slice(start, end);
          
          const { error: uploadError } = await supabase.storage
            .from('gallery')
            .upload(`${filePath}_part${i}`, chunk, {
              upsert: true
            });

          if (uploadError) throw uploadError;
        }
      } else {
        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(filePath, blob, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleCheckout = async () => {
    try {
      // Create checkout session immediately
      const checkoutPromise = supabase.functions.invoke('create-checkout', {
        body: {
          items: items.map(item => ({
            ...item,
            image_path: item.image_path?.startsWith('data:') ? null : item.image_path
          })),
          customerEmail: null,
          shippingAddress: null,
        },
      });

      // Start image uploads in parallel, but only for data URLs
      const imageUploads = items
        .filter(item => item.image_path?.startsWith('data:'))
        .map(async (item) => {
          try {
            const imageUrl = await uploadImageToStorage(item.image_path!);
            return { originalUrl: item.image_path, newUrl: imageUrl };
          } catch (error) {
            console.error('Failed to upload image:', error);
            return { originalUrl: item.image_path, newUrl: undefined };
          }
        });

      // Wait for checkout session while images upload in background
      const { data: checkoutData, error } = await checkoutPromise;

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!checkoutData?.url) {
        console.error('No checkout URL received:', checkoutData);
        throw new Error('No checkout URL received from Stripe');
      }

      // Start background processing of image uploads
      Promise.all(imageUploads).then(results => {
        results.forEach(({ originalUrl, newUrl }) => {
          if (newUrl) {
            console.log('Image uploaded successfully:', { originalUrl, newUrl });
          }
        });
      }).catch(error => {
        console.error('Background image upload failed:', error);
      });

      // Redirect to Stripe checkout immediately
      window.location.href = checkoutData.url;
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="border-t pt-4">
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Shipping</span>
          <span>${shippingCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Tax (5%)</span>
          <span>${taxAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
      <Button 
        onClick={handleCheckout}
        className="w-full bg-primary text-white"
      >
        Proceed to Checkout
      </Button>
    </div>
  );
};