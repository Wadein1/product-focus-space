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
  const shippingCost = 0; // Temporarily set to 0 for testing
  const taxRate = 0.05;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + shippingCost + taxAmount;

  const uploadImageToStorage = async (dataUrl: string): Promise<string> => {
    try {
      // Convert data URL to Blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Generate a unique filename
      const filename = `${uuidv4()}.${blob.type.split('/')[1]}`;
      const filePath = `cart-images/${filename}`;

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

  const handleCheckout = async () => {
    try {
      // Process items and handle image URLs
      const processedItems = await Promise.all(items.map(async (item) => {
        let imageUrl = item.image_path;

        // If it's a data URL, upload it to storage first
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

      console.log('Creating checkout session with processed items:', processedItems);

      const { data: checkoutData, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: processedItems,
          customerEmail: null, // Stripe will collect this
          shippingAddress: null, // Stripe will collect this
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