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

  const uploadImageToStorage = async (dataUrl: string, retryCount = 0): Promise<string> => {
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    try {
      console.log('Starting image upload, attempt:', retryCount + 1);
      
      // Convert to blob with optimized size
      const response = await fetch(dataUrl);
      const originalBlob = await response.blob();
      
      // Compress image if it's too large (over 1MB)
      let blob = originalBlob;
      if (originalBlob.size > 1024 * 1024) {
        console.log('Image size exceeds 1MB, compressing...');
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
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
        console.log('Image compressed successfully');
      }

      const filename = `${uuidv4()}.${blob.type.split('/')[1]}`;
      const filePath = `product-images/${filename}`;

      console.log('Uploading file:', filePath);

      // Use chunk upload for large files
      if (blob.size > 5 * 1024 * 1024) {
        console.log('Large file detected, using chunked upload');
        const chunkSize = 5 * 1024 * 1024; // 5MB chunks
        const chunks = Math.ceil(blob.size / chunkSize);
        
        for (let i = 0; i < chunks; i++) {
          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, blob.size);
          const chunk = blob.slice(start, end);
          
          const { error: uploadError } = await supabase.storage
            .from('gallery')
            .upload(`${filePath}_part${i}`, chunk, {
              upsert: true,
              cacheControl: '3600'
            });

          if (uploadError) {
            console.error('Chunk upload error:', uploadError);
            throw uploadError;
          }
        }
      } else {
        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(filePath, blob, {
            upsert: true,
            cacheControl: '3600'
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }
      }

      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      console.log('Upload successful, public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Upload attempt failed:', error);
      
      if (retryCount < maxRetries) {
        console.log(`Retrying upload in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return uploadImageToStorage(dataUrl, retryCount + 1);
      }
      
      toast({
        title: "Upload failed",
        description: "Failed to upload image after multiple attempts. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleCheckout = async () => {
    try {
      console.log('Starting checkout process');
      
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

      // Start image uploads in parallel for data URLs
      const imageUploads = items
        .filter(item => item.image_path?.startsWith('data:'))
        .map(async (item) => {
          try {
            console.log('Processing image upload for item:', item.product_name);
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
        toast({
          title: "Warning",
          description: "Some images may not have uploaded properly. Our team will handle this for you.",
          variant: "destructive",
        });
      });

      // Redirect to Stripe checkout immediately
      console.log('Redirecting to Stripe checkout:', checkoutData.url);
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