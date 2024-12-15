import { Button } from "@/components/ui/button";
import { Trash2, MinusIcon, PlusIcon } from "lucide-react";

interface CartItemProps {
  id: string;
  productName: string;
  price: number;
  quantity: number;
  imagePath?: string;
  onQuantityChange: (itemId: string, currentQuantity: number, increment: boolean) => void;
  onRemove: (itemId: string) => void;
}

export const CartItem = ({
  id,
  productName,
  price,
  quantity,
  imagePath,
  onQuantityChange,
  onRemove,
}: CartItemProps) => {
  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      {imagePath && (
        <img 
          src={imagePath} 
          alt={productName}
          className="w-24 h-24 object-cover rounded-md"
        />
      )}
      <div className="flex-1">
        <h3 className="font-semibold">{productName}</h3>
        <p className="text-gray-600">${price}</p>
        <div className="flex items-center space-x-2 mt-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onQuantityChange(id, quantity, false)}
            disabled={quantity <= 1}
          >
            <MinusIcon className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onQuantityChange(id, quantity, true)}
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Button
        variant="destructive"
        size="icon"
        onClick={() => onRemove(id)}
        className="flex-shrink-0"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};