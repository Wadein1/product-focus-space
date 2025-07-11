import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ProgressiveImageLoader } from './ProgressiveImageLoader';
import { Skeleton } from '@/components/ui/skeleton';

interface FundraiserImageCarouselProps {
  images: string[];
  title: string;
  onImageLoad?: () => void;
  isLoaded?: boolean;
}

export const FundraiserImageCarousel = ({ 
  images, 
  title, 
  onImageLoad,
  isLoaded = false
}: FundraiserImageCarouselProps) => {
  if (!images || images.length === 0) {
    return (
      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  // If only one image, show it directly without carousel controls
  if (images.length === 1) {
    return (
      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
        <ProgressiveImageLoader
          src={images[0]}
          alt={title}
          className="w-full h-full"
          onLoad={onImageLoad}
          showSkeleton={!isLoaded}
          priority={true}
        />
      </div>
    );
  }

  return (
    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
      <Carousel className="w-full h-full">
        <CarouselContent className="h-full">
          {images.map((imageUrl, index) => (
            <CarouselItem key={index} className="h-full">
              <div className="h-full">
                <ProgressiveImageLoader
                  src={imageUrl}
                  alt={`${title} - Image ${index + 1}`}
                  className="w-full h-full"
                  onLoad={onImageLoad}
                  showSkeleton={!isLoaded}
                  priority={index === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Only show navigation if there are multiple images */}
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
        
        {/* Image counter */}
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {images.length} photos
        </div>
      </Carousel>
    </div>
  );
};