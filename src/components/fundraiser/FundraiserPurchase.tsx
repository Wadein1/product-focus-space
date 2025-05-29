
import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/types/cart";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Truck, MapPin } from "lucide-react";

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
      console.log('Creating fundraiser checkout with:', {
        quantity,
        shippingCost,
        fundraiserId,
        variationId,
        deliveryMethod
      });

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
            is_fundraiser: 'true',
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
          <p className="text-2xl font-bold">${(price * quantity).toFixed(2)}</p>
          {deliveryMethod === "shipping" && (
            <p className="text-sm text-gray-500">(+$8.00 shipping)</p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base font-semibold">Delivery Method</Label>
          <div className="grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={() => setDeliveryMethod('shipping')}
              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                deliveryMethod === 'shipping'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Truck className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium">Ship to me</p>
                  <p className="text-sm text-gray-500">+$8.00 shipping</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 ${
                deliveryMethod === 'shipping' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
              }`}>
                {deliveryMethod === 'shipping' && (
                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                )}
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setDeliveryMethod('pickup')}
              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                deliveryMethod === 'pickup'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium">Pickup from my team</p>
                  <p className="text-sm text-gray-500">No shipping cost</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 ${
                deliveryMethod === 'pickup' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
              }`}>
                {deliveryMethod === 'pickup' && (
                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                )}
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold">Quantity</Label>
          <div className="flex items-center space-x-0 bg-white rounded-lg border border-gray-200 w-fit">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onQuantityChange(false)}
              disabled={quantity <= 1}
              className="h-12 w-12 p-0 rounded-l-lg border-r hover:bg-gray-50"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="h-12 w-16 flex items-center justify-center border-r text-lg font-medium">
              {quantity}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onQuantityChange(true)}
              className="h-12 w-12 p-0 rounded-r-lg hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" />
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
