import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FundraiserPurchaseProps {
  basePrice: number;
  quantity: number;
  onQuantityChange: (increment: boolean) => void;
  fundraiserId: string;
  variationId: string;
  productName: string;
  imagePath?: string;
}

export const FundraiserPurchase = ({
  basePrice,
  quantity,
  onQuantityChange,
  fundraiserId,
  variationId,
  productName,
  imagePath,
}: FundraiserPurchaseProps) => {
  const { toast } = useToast();

  const calculateTotalPrice = (basePrice: number, quantity: number) => {
    const subtotal = basePrice * quantity;
    const tax = subtotal * 0.05; // 5% tax only, no shipping for fundraisers
    return subtotal + tax;
  };

  const handleBuyNow = async () => {
    try {
      const totalPrice = calculateTotalPrice(basePrice, quantity);

      const { data: checkoutData, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: [{
            product_name: productName,
            price: totalPrice,
            quantity: quantity,
            image_path: imagePath,
            is_fundraiser: true, // Add this flag to identify fundraiser purchases
          }],
          fundraiserId,
          variationId,
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

  const subtotal = basePrice * quantity;
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  return (
    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
      <div className="border-t border-b py-4">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold">${basePrice}</p>
          <p className="text-sm text-gray-500">(+5% tax)</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Quantity:</span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuantityChange(false)}
              disabled={quantity <= 1}
            >
              -
            </Button>
            <span className="w-12 text-center">{quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuantityChange(true)}
            >
              +
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Tax (5%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <Button 
          onClick={handleBuyNow}
          className="w-full bg-primary text-white hover:bg-primary/90"
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
};