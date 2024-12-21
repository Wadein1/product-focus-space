import { CartItem as CartItemType } from "@/types/cart";
import { Button } from "@/components/ui/button";

interface CartSummaryTotalProps {
  items: CartItemType[];
  onCheckout: () => void;
  isProcessing: boolean;
}

export const CartSummaryTotal = ({ items, onCheckout, isProcessing }: CartSummaryTotalProps) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const shippingCost = 8.00;
  const taxRate = 0.05;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + shippingCost + taxAmount;

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <div className="space-y-4">
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
        <div className="flex justify-between font-semibold mt-4 pt-4 border-t border-gray-200">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
      <Button 
        onClick={onCheckout}
        className="w-full mt-6 bg-primary hover:bg-primary/90 text-white"
        disabled={isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
      </Button>
    </div>
  );
};