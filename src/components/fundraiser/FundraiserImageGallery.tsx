import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface FundraiserImageGalleryProps {
  images: Array<{
    id: string;
    image_path: string;
    display_order: number;
  }>;
  title: string;
  onImageLoad?: () => void;
}

export const FundraiserImageGallery = ({ 
  images, 
  title, 
  onImageLoad 
}: FundraiserImageGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  // Sort images by display_order
  const sortedImages = [...images].sort((a, b) => a.display_order - b.display_order);
  const currentImage = sortedImages[currentImageIndex];

  const getImageUrl = (imagePath: string) => {
    const { data: { publicUrl } } = supabase
      .storage
      .from('gallery')
      .getPublicUrl(imagePath);
    return publicUrl;
  };

  const handleImageLoad = () => {
    setLoading(false);
    onImageLoad?.();
  };

  const handleImageError = () => {
    console.error('Image failed to load:', currentImage?.image_path);
    setError('Failed to load image');
    setLoading(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % sortedImages.length);
    setLoading(true);
    setError(null);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length);
    setLoading(true);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
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
          currentImage && (
            <img
              src={getImageUrl(currentImage.image_path)}
              alt={`${title} - Image ${currentImageIndex + 1}`}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                loading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="eager"
            />
          )
        )}

        {/* Navigation Arrows */}
        {sortedImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
              onClick={prevImage}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
              onClick={nextImage}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {sortedImages.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {currentImageIndex + 1} / {sortedImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {sortedImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sortedImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => {
                setCurrentImageIndex(index);
                setLoading(true);
                setError(null);
              }}
              className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all ${
                index === currentImageIndex 
                  ? 'border-primary shadow-md' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={getImageUrl(image.image_path)}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};