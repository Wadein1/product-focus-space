import { useToast } from "@/hooks/use-toast";
import { CartItem as CartItemType } from "@/types/cart";
import { supabase } from "@/integrations/supabase/client";
import { useImageUpload } from "@/hooks/useImageUpload";
import { CartSummaryTotal } from "./CartSummaryTotal";

interface CartSummaryProps {
  items: CartItemType[];
}

export const CartSummary = ({ items }: CartSummaryProps) => {
  const { toast } = useToast();
  const { uploadImage, isUploading } = useImageUpload();

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
            const imageUrl = await uploadImage(item.image_path!);
            return { originalUrl: item.image_path, newUrl: imageUrl };
          } catch (error) {
            console.error('Failed to upload image:', error);
            return { originalUrl: item.image_path, newUrl: null };
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
    <CartSummaryTotal 
      items={items}
      onCheckout={handleCheckout}
      isProcessing={isUploading}
    />
  );
};