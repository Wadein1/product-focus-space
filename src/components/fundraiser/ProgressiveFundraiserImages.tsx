
import React from 'react';
import { ProgressiveImageLoader } from './ProgressiveImageLoader';

interface ProgressiveFundraiserImagesProps {
  mainImage: string;
  title: string;
  imageUrl?: string;
  onImageLoad?: () => void;
  isLoaded?: boolean;
}

export const ProgressiveFundraiserImages = ({ 
  mainImage, 
  title, 
  imageUrl,
  onImageLoad,
  isLoaded = false
}: ProgressiveFundraiserImagesProps) => {
  if (!imageUrl && !mainImage) {
    return (
      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">No image available</p>
      </div>
    );
  }

  return (
    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
      {imageUrl && (
        <ProgressiveImageLoader
          src={imageUrl}
          alt={title}
          className="w-full h-full"
          onLoad={onImageLoad}
          showSkeleton={!isLoaded}
          priority={true}
        />
      )}
    </div>
  );
};
