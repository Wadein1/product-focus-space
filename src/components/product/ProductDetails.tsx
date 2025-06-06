
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
  isProcessing?: boolean;
  chainColors?: { id: string; name: string; color?: string | null }[];
  selectedChainColor: string;
  onChainColorChange: (value: string) => void;
  isMobile?: boolean;
}

export const ProductDetails = ({
  quantity,
  onQuantityChange,
  onBuyNow,
  onAddToCart,
  isAddingToCart,
  isProcessing = false,
  chainColors = [],
  selectedChainColor,
  onChainColorChange,
  isMobile = false
}: ProductDetailsProps) => {
  return (
    <div className="space-y-6">
      {/* Desktop title and discount */}
      {!isMobile && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Custom Medallion</h1>
            <div className="bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold w-fit">
              17% OFF
            </div>
          </div>
          <p className="text-lg text-gray-600">
            Gradient coloring is not supported and will be modified by our designers if submitted
          </p>
          <div className="border-t border-b py-4">
            <h2 className="text-xl font-semibold mb-2">Features:</h2>
            <ul className="space-y-2 text-gray-600">
              <li>• Premium quality lightweight materials</li>
              <li>• Up to 10 x 10 inch design</li>
              <li>• Custom designed and made</li>
            </ul>
          </div>
        </>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap items-baseline gap-2">
          <p className="text-2xl font-bold">$49.99</p>
          <p className="text-sm line-through text-gray-400">$59.99</p>
          <p className="text-sm text-gray-500">(+$5.00 shipping)</p>
        </div>
        
        <div className="space-y-4">
          <div className="form-group relative">
            <label htmlFor="chainColor" className="block text-sm font-medium text-gray-700 mb-2">
              Chain Links Color
            </label>
            <Select 
              value={selectedChainColor} 
              onValueChange={onChainColorChange}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select chain color" />
              </SelectTrigger>
              <SelectContent className="z-[100] bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200">
                <SelectItem value="Designers' Choice">Designers' Choice</SelectItem>
                {chainColors.map((color) => (
                  <SelectItem 
                    key={color.id} 
                    value={color.name}
                    className="hover:bg-gray-100"
                  >
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
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Buy Now'}
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
