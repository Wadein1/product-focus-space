import React from 'react';
import { Button } from '@/components/ui/button';
import { MinusIcon, PlusIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductDetailsProps {
  quantity: number;
  onQuantityChange: (increment: boolean) => void;
  onBuyNow: () => void;
  onAddToCart: () => void;
  isAddingToCart: boolean;
  chainColors?: { id: string; name: string; color?: string | null }[];
  selectedChainColor: string;
  onChainColorChange: (value: string) => void;
}

export const ProductDetails = ({
  quantity,
  onQuantityChange,
  onBuyNow,
  onAddToCart,
  isAddingToCart,
  chainColors = [],
  selectedChainColor,
  onChainColorChange
}: ProductDetailsProps) => {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">Custom Medallion</h1>
      <p className="text-lg text-gray-600">
        Gradient coloring is not supported and will be modified by our designers if submitted
      </p>
      <div className="border-t border-b py-4">
        <h2 className="text-xl font-semibold mb-2">Features:</h2>
        <ul className="space-y-2 text-gray-600">
          <li>• Premium quality materials</li>
          <li>• 10 Inch design</li>
          <li>• Custom designed and made</li>
        </ul>
      </div>
      <div className="space-y-4">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold">$49.99</p>
          <p className="text-sm text-gray-500">(+$8.00 shipping & 5% tax)</p>
        </div>
        
        <div className="space-y-4">
          <div className="form-group">
            <label htmlFor="chainColor" className="block text-sm font-medium text-gray-700 mb-2">
              Chain Color
            </label>
            <Select value={selectedChainColor} onValueChange={onChainColorChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select chain color" />
              </SelectTrigger>
              <SelectContent>
                {chainColors.map((color) => (
                  <SelectItem key={color.id} value={color.name}>
                    {color.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onQuantityChange(false)}
                disabled={quantity <= 1}
              >
                <MinusIcon className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onQuantityChange(true)}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={onBuyNow}
            className="w-full bg-primary text-white hover:bg-primary/90"
          >
            Buy Now
          </Button>
          <Button 
            onClick={onAddToCart}
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary/10"
            disabled={isAddingToCart}
          >
            {isAddingToCart ? 'Adding to Cart...' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
};