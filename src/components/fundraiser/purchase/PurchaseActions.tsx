
import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/types/cart";

interface PurchaseActionsProps {
  price: number;
  quantity: number;
  productName: string;
  imagePath?: string;
  fundraiserId: string;
  variationId: string;
  deliveryMethod: 'shipping' | 'pickup';
  ageDivision: string;
  teamName: string;
  fundraiserTitle?: string;
  variationTitle?: string;
}

export const PurchaseActions = ({
  price,
  quantity,
  productName,
  imagePath,
  fundraiserId,
  variationId,
  deliveryMethod,
  ageDivision,
  teamName,
  fundraiserTitle,
  variationTitle,
}: PurchaseActionsProps) => {
  const { toast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = React.useState(false);

  const validateTeamSelection = () => {
    if (deliveryMethod === 'pickup' && (!ageDivision || !teamName)) {
      toast({
        title: "Team selection required",
        description: "Please select both age division and team for pickup orders.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!validateTeamSelection()) return;

    try {
      setIsAddingToCart(true);

      const cartItem: CartItem = {
        id: crypto.randomUUID(),
        product_name: productName,
        price: price,
        quantity: quantity,
        image_path: imagePath,
        is_fundraiser: true,
        delivery_method: deliveryMethod,
        ...(deliveryMethod === 'pickup' && {
          team_name: `${ageDivision} - ${teamName}`
        })
      };

      const existingCartJson = localStorage.getItem('cartItems');
      const existingCart = existingCartJson ? JSON.parse(existingCartJson) : [];
      const updatedCart = [...existingCart, cartItem];
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));

      toast({
        title: "Added to cart",
        description: "The item has been added to your cart",
      });
    } catch (error: any) {
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

  const handleBuyNow = async () => {
    if (!validateTeamSelection()) return;

    try {
      const shippingCost = deliveryMethod === 'shipping' ? 5.00 : 0;
      console.log('Creating fundraiser checkout with:', {
        quantity,
        shippingCost,
        fundraiserId,
        variationId,
        deliveryMethod,
        ageDivision,
        teamName,
        fundraiserTitle,
        variationTitle
      });

      const { data: checkoutData, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: [{
            product_name: productName,
            price: price,
            quantity: quantity,
            image_path: imagePath,
            is_fundraiser: true,
            delivery_method: deliveryMethod,
            ...(deliveryMethod === 'pickup' && {
              team_name: `${ageDivision} - ${teamName}`
            })
          }],
          metadata: {
            fundraiser_id: fundraiserId,
            variation_id: variationId,
            is_fundraiser: 'true',
            delivery_method: deliveryMethod,
            fundraiser_name: fundraiserTitle || 'Unknown Fundraiser',
            item_name: variationTitle || productName,
            ...(deliveryMethod === 'pickup' && {
              team_age_division: ageDivision,
              team_name: teamName,
              pickup_team_name: teamName
            })
          },
          shipping_cost: shippingCost
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
    <div className="space-y-3">
      <Button 
        onClick={handleBuyNow}
        className="w-full bg-[#0CA2ED] hover:bg-[#0CA2ED]/90 text-white font-medium py-6"
        size="lg"
      >
        Buy Now
      </Button>
      <Button 
        onClick={handleAddToCart}
        variant="outline"
        className="w-full border-[#0CA2ED] text-[#0CA2ED] hover:bg-[#0CA2ED]/10"
        size="lg"
        disabled={isAddingToCart}
      >
        {isAddingToCart ? 'Adding to Cart...' : 'Add to Cart'}
      </Button>
    </div>
  );
};
