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
      // Update any Custom Medallion prices to match the new pricing
      const processedItems = items.map(item => ({
        ...item,
        // Ensure Custom Medallion items have the correct price
        price: item.product_name === 'Custom Medallion' ? 49.99 : item.price,
        // Keep data URLs as is, they'll be handled by the checkout function
        image_path: item.image_path
      }));

      const hasShippingItems = items.some(item => 
        (item.delivery_method === "shipping" || (!item.delivery_method && !item.is_fundraiser))
      );
      
      // Set shipping cost to $5 for all items that require shipping
      const shippingCost = hasShippingItems ? 5.00 : 0;

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
        throw error;
      }

      if (!checkoutData?.url) {
        throw new Error('No checkout URL received from Stripe');
      }

      // Start image uploads in parallel for data URLs
      const imageUploads = items
        .filter(item => item.image_path?.startsWith('data:'))
        .map(async (item) => {
          try {
            const imageUrl = await uploadImage(item.image_path!);
            return { originalUrl: item.image_path, newUrl: imageUrl };
          } catch (error) {
            return { originalUrl: item.image_path, newUrl: null };
          }
        });

      // Handle image uploads in the background
      Promise.all(imageUploads)
        .then(results => {
          results.forEach(({ newUrl }) => {
            if (!newUrl) {
              toast({
                title: "Warning",
                description: "Some images may not have uploaded properly. Our team will handle this for you.",
                variant: "destructive",
              });
            }
          });
        })
        .catch(() => {
          toast({
            title: "Warning",
            description: "Some images may not have uploaded properly. Our team will handle this for you.",
            variant: "destructive",
          });
        });

      // Redirect to Stripe checkout
      window.location.href = checkoutData.url;
    } catch (error: any) {
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
