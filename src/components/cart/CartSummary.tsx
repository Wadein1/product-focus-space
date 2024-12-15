import { Button } from "@/components/ui/button";
import { CartItem as CartItemType } from "@/types/cart";

interface CartSummaryProps {
  items: CartItemType[];
  onCheckout: () => void;
}

export const CartSummary = ({ items, onCheckout }: CartSummaryProps) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  return (
    <div className="border-t pt-4">
      <div className="flex justify-between mb-4">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
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