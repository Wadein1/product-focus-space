
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface FundraiserImagesProps {
  mainImage: string;
  title: string;
  imageUrl?: string;
  onImageLoad?: () => void;
}

export const FundraiserImages = ({ 
  mainImage, 
  title, 
  imageUrl,
  onImageLoad 
}: FundraiserImagesProps) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const handleImageLoad = () => {
    setLoading(false);
    onImageLoad?.();
  };

  const handleImageError = () => {
    console.error('Main image failed to load:', imageUrl);
    setError('Failed to load image');
    setLoading(false);
  };

  if (!imageUrl && !mainImage) {
    return (
      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">No image available</p>
      </div>
    );
  }

  return (
    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
      {loading && (
        <div className="absolute inset-0 z-10">
          <Skeleton className="w-full h-full" />
        </div>
      )}
      
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500 text-center">
            Image failed to load
          </p>
        </div>
      ) : (
        imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              loading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="eager"
          />
        )
      )}
    </div>
  );
};
