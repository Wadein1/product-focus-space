import React from 'react';
import { supabase } from "@/integrations/supabase/client";

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

interface FundraiserVariationCardProps {
  variation: Variation;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const FundraiserVariationCard = ({
  variation,
  isSelected,
  onSelect,
}: FundraiserVariationCardProps) => {
  const getImageUrl = (imagePath: string) => {
    const { data: { publicUrl } } = supabase
      .storage
      .from('gallery')
      .getPublicUrl(imagePath);
    return publicUrl;
  };

  // Get the primary image (first by display order, or fallback to variation's image_path)
  const primaryImage = variation.fundraiser_variation_images?.length > 0
    ? variation.fundraiser_variation_images
        .sort((a, b) => a.display_order - b.display_order)[0]
    : { image_path: variation.image_path };

  return (
    <button
      onClick={() => onSelect(variation.id)}
      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
        isSelected 
          ? 'border-primary shadow-md' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {primaryImage?.image_path ? (
        <img
          src={getImageUrl(primaryImage.image_path)}
          alt={variation.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            console.error('Variation image failed to load:', primaryImage.image_path);
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <p className="text-gray-500 text-xs">No image</p>
        </div>
      )}

      {/* Image count indicator */}
      {variation.fundraiser_variation_images && variation.fundraiser_variation_images.length > 1 && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {variation.fundraiser_variation_images.length}
        </div>
      )}

      {/* Variation title overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">
        <p className="truncate">{variation.title}</p>
      </div>
    </button>
  );
};