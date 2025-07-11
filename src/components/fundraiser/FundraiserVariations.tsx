
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { FundraiserVariationCard } from './FundraiserVariationCard';

interface Variation {
  id: string;
  title: string;
  image_path: string;
  is_default: boolean;
  fundraiser_variation_images?: Array<{
    id: string;
    image_path: string;
    display_order: number;
  }>;
}

interface FundraiserVariationsProps {
  variations: Variation[];
  selectedVariation: string | null;
  onVariationSelect: (id: string) => void;
  imageUrls?: Record<string, string>;
  imagesLoading?: boolean;
}

export const FundraiserVariations = ({
  variations,
  selectedVariation,
  onVariationSelect,
  imageUrls = {},
  imagesLoading = false,
}: FundraiserVariationsProps) => {
  if (imagesLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Variations</h3>
        <div className="space-y-2">
          {variations?.slice(0, 4).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Variations</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {variations?.map((variation) => (
          <FundraiserVariationCard
            key={variation.id}
            variation={variation}
            isSelected={selectedVariation === variation.id}
            onSelect={onVariationSelect}
          />
        ))}
      </div>
    </div>
  );
};
