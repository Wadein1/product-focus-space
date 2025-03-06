
import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/types/cart";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface FundraiserPurchaseProps {
  price: number;
  quantity: number;
  onQuantityChange: (increment: boolean) => void;
  fundraiserId: string;
  variationId: string;
  productName: string;
  imagePath?: string;
}

export const FundraiserPurchase = ({
  price,
  quantity,
  onQuantityChange,
  fundraiserId,
  variationId,
  productName,
  imagePath,
}: FundraiserPurchaseProps) => {
  const { toast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = React.useState(false);
  const [deliveryMethod, setDeliveryMethod] = React.useState<'shipping' | 'pickup'>('shipping');

  const handleDeliveryMethodChange = (value: string) => {
    setDeliveryMethod(value as 'shipping' | 'pickup');
  };

  const handleAddToCart = () => {
    try {
      setIsAddingToCart(true);
      const cartItem: CartItem = {
        id: crypto.randomUUID(),
        product_name: productName,
        price: price,
        quantity: quantity,
        image_path: imagePath,
        is_fundraiser: true,
        delivery_method: deliveryMethod
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
    try {
      const shippingCost = deliveryMethod === 'shipping' ? 8.00 : 0;
      console.log('Creating checkout with shipping cost:', shippingCost);

      const { data: checkoutData, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: [{
            product_name: productName,
            price: price,
            quantity: quantity,
            image_path: imagePath,
            is_fundraiser: true,
            delivery_method: deliveryMethod
          }],
          metadata: {
            fundraiser_id: fundraiserId,
            variation_id: variationId,
            is_fundraiser: true,
            delivery_method: deliveryMethod
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
    <div className="space-y-6 bg-gray-50 p-4 rounded-lg">
      <div className="border-t border-b py-4">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold">${price}</p>
          {deliveryMethod === "shipping" && (
            <p className="text-sm text-gray-500">(+$8.00 shipping, +5% tax)</p>
          )}
          {deliveryMethod === "pickup" && (
            <p className="text-sm text-gray-500">(+5% tax)</p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <Label>Delivery Method</Label>
          <RadioGroup defaultValue="shipping" value={deliveryMethod} onValueChange={handleDeliveryMethodChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="shipping" id="shipping" />
              <Label htmlFor="shipping">Ship to me (+$8.00)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pickup" id="pickup" />
              <Label htmlFor="pickup">Pickup from my team</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Quantity:</span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuantityChange(false)}
              disabled={quantity <= 1}
              className="h-8 w-8 p-0"
            >
              -
            </Button>
            <span className="w-12 text-center">{quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuantityChange(true)}
              className="h-8 w-8 p-0"
            >
              +
            </Button>
          </div>
        </div>

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
      </div>
    </div>
  );
};
