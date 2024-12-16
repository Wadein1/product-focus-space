import React from 'react';
import { Button } from "@/components/ui/button";

interface Variation {
  id: string;
  title: string;
  image_path: string;
  is_default: boolean;  // Added this property to match the database schema
}

interface FundraiserVariationsProps {
  variations: Variation[];
  selectedVariation: string | null;
  onVariationSelect: (id: string) => void;
}

export const FundraiserVariations = ({
  variations,
  selectedVariation,
  onVariationSelect,
}: FundraiserVariationsProps) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {variations?.map((variation) => (
        <button
          key={variation.id}
          onClick={() => onVariationSelect(variation.id)}
          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
            selectedVariation === variation.id 
              ? 'border-primary shadow-lg' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <img
            src={variation.image_path}
            alt={variation.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
            <p className="text-white text-sm text-center truncate">
              {variation.title}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};