import { Button } from "@/components/ui/button";
import { CartItem as CartItemType } from "@/types/cart";

interface CartSummaryProps {
  items: CartItemType[];
  onCheckout: () => void;
}

export const CartSummary = ({ items, onCheckout }: CartSummaryProps) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const shippingCost = 8.00;
  const taxRate = 0.05;
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
        onClick={onCheckout}
        className="w-full bg-primary text-white"
      >
        Proceed to Checkout
      </Button>
    </div>
  );
};