import React from 'react';
import { ProgressiveImageLoader } from './ProgressiveImageLoader';
import { Skeleton } from "@/components/ui/skeleton";

interface Variation {
  id: string;
  title: string;
  image_path: string;
  is_default: boolean;
}

interface FundraiserVariationsProps {
  variations: Variation[];
  selectedVariation: string | null;
  onVariationSelect: (id: string) => void;
  imageUrls?: Record<string, string>;
  imagesLoading?: boolean;
  loadedImages?: Record<string, boolean>;
  onImageLoad?: (id: string) => void;
}

export const FundraiserVariations = ({
  variations,
  selectedVariation,
  onVariationSelect,
  imageUrls = {},
  imagesLoading = false,
  loadedImages = {},
  onImageLoad,
}: FundraiserVariationsProps) => {
  if (imagesLoading) {
    return (
      <div className="grid grid-cols-4 gap-2">
        {variations?.slice(0, 4).map((_, index) => (
          <Skeleton key={index} className="aspect-square rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {variations?.map((variation) => (
        <button
          key={variation.id}
          onClick={() => onVariationSelect(variation.id)}
          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
            selectedVariation === variation.id 
              ? 'border-primary shadow-md' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {imageUrls[variation.id] ? (
            <ProgressiveImageLoader
              src={imageUrls[variation.id]}
              alt={variation.title}
              className="w-full h-full"
              onLoad={() => onImageLoad?.(variation.id)}
              showSkeleton={!loadedImages?.[variation.id]}
              priority={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <p className="text-gray-500 text-xs">No image</p>
            </div>
          )}
        </button>
      ))}
    </div>
  );
};