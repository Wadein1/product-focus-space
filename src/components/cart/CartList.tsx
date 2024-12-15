import { CartItem as CartItemComponent } from "./CartItem";
import type { CartItem as CartItemType } from "@/types/cart";

interface CartListProps {
  items: CartItemType[];
  onQuantityChange: (itemId: string, currentQuantity: number, increment: boolean) => void;
  onRemove: (itemId: string) => void;
}

export const CartList = ({ items, onQuantityChange, onRemove }: CartListProps) => {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <CartItemComponent
          key={item.id}
          id={item.id}
          productName={item.product_name}
          price={item.price}
          quantity={item.quantity}
          imagePath={item.image_path}
          onQuantityChange={onQuantityChange}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};