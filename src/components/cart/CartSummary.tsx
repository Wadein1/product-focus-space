import { useToast } from "@/hooks/use-toast";
import { CartItem as CartItemType } from "@/types/cart";
import { supabase } from "@/integrations/supabase/client";
import { useImageUpload } from "@/hooks/useImageUpload";
import { CartSummaryTotal } from "./CartSummaryTotal";

interface CartSummaryProps {
  items: CartItemType[];
  isFundraiser?: boolean;
}

export const CartSummary = ({ items, isFundraiser = false }: CartSummaryProps) => {
  const { toast } = useToast();
  const { uploadImage, isUploading } = useImageUpload();

  const handleCheckout = async () => {
    try {
      console.log('Starting checkout process');
      
      // Update any Custom Medallion prices to match the new pricing
      const processedItems = items.map(item => ({
        ...item,
        // Ensure Custom Medallion items have the correct price
        price: item.product_name === 'Custom Medallion' ? 29.99 : item.price,
        // Keep data URLs as is, they'll be handled by the checkout function
        image_path: item.image_path
      }));

      const hasShippingItems = items.some(item => 
        (item.delivery_method === "shipping" || (!item.delivery_method && !item.is_fundraiser))
      );
      
      // Set shipping cost based on whether there are items requiring shipping
      const shippingCost = hasShippingItems ? 8.00 : 0;

      // Prepare metadata with all available information from each item
      const metadata = {
        // Add brand identifier to differentiate from other websites using the same Supabase project
        brand: "Gimme Drip"
      };
      
      // Get metadata from items (for team info, etc.)
      items.forEach((item, index) => {
        if (item.team_name) {
          metadata[`item_${index}_team_name`] = item.team_name;
        }
        if (item.team_location) {
          metadata[`item_${index}_team_location`] = item.team_location;
        }
        if (item.chain_color) {
          metadata[`item_${index}_chain_color`] = item.chain_color;
        }
        
        // Determine and add design type
        const designType = item.image_path ? 'custom_upload' : 'team_logo';
        metadata[`item_${index}_design_type`] = designType;
      });
      
      console.log('Sending checkout metadata:', metadata);
      console.log('Shipping cost being applied:', shippingCost);

      // Create checkout session
      const { data: checkoutData, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: processedItems,
          customerEmail: null,
          shippingAddress: null,
          isFundraiser,
          shipping_cost: shippingCost,
          metadata
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

      // Handle image uploads in the background
      Promise.all(imageUploads)
        .then(results => {
          results.forEach(({ originalUrl, newUrl }) => {
            if (newUrl) {
              console.log('Image uploaded successfully:', { originalUrl, newUrl });
            }
          });
        })
        .catch(error => {
          console.error('Background image upload failed:', error);
          toast({
            title: "Warning",
            description: "Some images may not have uploaded properly. Our team will handle this for you.",
            variant: "destructive",
          });
        });

      // Redirect to Stripe checkout
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
      isFundraiser={isFundraiser}
    />
  );
};
