
import { CartItem as CartItemType } from "@/types/cart";
import { Button } from "@/components/ui/button";

interface CartSummaryTotalProps {
  items: CartItemType[];
  onCheckout: () => void;
  isProcessing: boolean;
  isFundraiser?: boolean;
}

export const CartSummaryTotal = ({ items, onCheckout, isProcessing, isFundraiser = false }: CartSummaryTotalProps) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  
  // Calculate shipping based on item types
  const hasShippingItems = items.some(item => 
    (item.delivery_method === "shipping" || (!item.delivery_method && !item.is_fundraiser))
  );
  
  // Use $5 shipping for fundraiser items, $5 for regular items
  const shippingCost = hasShippingItems ? 5.00 : 0;
  
  // No tax for fundraiser items
  const taxRate = isFundraiser ? 0 : 0.05;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + shippingCost + taxAmount;

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
        {!isFundraiser && (
          <div className="flex justify-between text-sm text-gray-600">
            <span>Tax (5%)</span>
            <span>${taxAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
      <Button 
        onClick={onCheckout}
        className="w-full bg-primary text-white"
        disabled={isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
      </Button>
    </div>
  );
};
