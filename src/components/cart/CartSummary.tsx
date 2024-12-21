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

  const handleCheckout = async () => {
    try {
      // Start image uploads in parallel
      const imageUploadPromises = items
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

      // Create checkout session immediately with original items
      const checkoutPromise = supabase.functions.invoke('create-checkout', {
        body: {
          items: items.map(item => ({
            ...item,
            // Keep original image_path for now, will be updated later
            image_path: item.image_path
          })),
          customerEmail: null,
          shippingAddress: null,
        },
      });

      // Wait for checkout session creation (but not image uploads)
      const { data: checkoutData, error } = await checkoutPromise;

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!checkoutData?.url) {
        console.error('No checkout URL received:', checkoutData);
        throw new Error('No checkout URL received from Stripe');
      }

      // Continue with image uploads in the background
      imageUploadPromises.forEach(async (promise) => {
        try {
          const { originalUrl, newUrl } = await promise;
          if (newUrl) {
            console.log('Image uploaded successfully:', { originalUrl, newUrl });
            // Here you could update the order with the new image URL if needed
          }
        } catch (error) {
          console.error('Background image upload failed:', error);
        }
      });

      // Redirect to Stripe immediately
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
