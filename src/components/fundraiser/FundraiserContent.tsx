
import React, { useState } from 'react';
import { FundraiserImageCarousel } from './FundraiserImageCarousel';
import { ProgressiveFundraiserVariations } from './ProgressiveFundraiserVariations';
import { FundraiserPurchase } from './FundraiserPurchase';
import { ImagePreloader } from './ImagePreloader';
import { useImageBatch } from '@/hooks/useImageBatch';

interface FundraiserContentProps {
  fundraiser: any;
  defaultVariation: any;
  selectedVariation: string | null;
  setSelectedVariation: (id: string) => void;
  imagesLoaded?: Record<string, boolean>;
  onImageLoad?: (id: string) => void;
  onImageError?: (id: string) => void;
  showProgressiveLoading?: boolean;
}

export const FundraiserContent = ({
  fundraiser,
  defaultVariation,
  selectedVariation,
  setSelectedVariation,
  imagesLoaded = {},
  onImageLoad,
  onImageError,
  showProgressiveLoading = false,
}: FundraiserContentProps) => {
  const [quantity, setQuantity] = useState(1);
  const selectedVariationData = fundraiser?.fundraiser_variations?.find(v => v.id === selectedVariation);

  // Prepare image paths for batch loading - include all variation images
  const imagePaths = React.useMemo(() => {
    if (!fundraiser?.fundraiser_variations) return [];
    
    const paths = [];
    
    for (const variation of fundraiser.fundraiser_variations) {
      // Add main variation image
      if (variation.image_path) {
        paths.push({
          id: `${variation.id}_main`,
          path: variation.image_path
        });
      }
      
      // Add additional variation images
      if (variation.fundraiser_variation_images) {
        variation.fundraiser_variation_images.forEach((img: any, index: number) => {
          paths.push({
            id: `${variation.id}_${index}`,
            path: img.image_path
          });
        });
      }
    }
    
    return paths;
  }, [fundraiser?.fundraiser_variations]);

  const { images, loading: imagesLoading } = useImageBatch(imagePaths);

  // Preload all images immediately for better performance
  const allImageUrls = React.useMemo(() => {
    return Object.values(images).map(imageData => imageData.url).filter(Boolean);
  }, [images]);

  const handleQuantityChange = (increment: boolean) => {
    setQuantity(increment ? quantity + 1 : Math.max(1, quantity - 1));
  };

  const handleImageLoad = (imageId?: string) => {
    if (imageId) {
      onImageLoad?.(imageId);
    } else {
      // Main image loaded
      const mainImageId = selectedVariationData?.id || defaultVariation?.id;
      if (mainImageId) {
        onImageLoad?.(mainImageId);
      }
    }
  };

  if (!fundraiser) return null;

  // Get all images for the selected variation
  const getVariationImages = (variationId: string) => {
    const imageUrls = [];
    const variation = fundraiser?.fundraiser_variations?.find((v: any) => v.id === variationId);
    
    // If variation has additional images, use only those (they should include the main image)
    if (variation?.fundraiser_variation_images && variation.fundraiser_variation_images.length > 0) {
      variation.fundraiser_variation_images
        .sort((a: any, b: any) => a.display_order - b.display_order)
        .forEach((img: any, index: number) => {
          const imageUrl = images[`${variationId}_${index}`]?.url;
          if (imageUrl) imageUrls.push(imageUrl);
        });
    } else if (variation?.image_path) {
      // Fallback to main image if no additional images
      const mainImageUrl = images[`${variationId}_main`]?.url;
      if (mainImageUrl) imageUrls.push(mainImageUrl);
    }
    
    return imageUrls;
  };

  // Extract image URLs for variations (for the variation selector)
  const variationImageUrls = Object.fromEntries(
    fundraiser?.fundraiser_variations?.map((variation: any) => [
      variation.id, 
      images[`${variation.id}_main`]?.url || ''
    ]) || []
  );

  return (
    <>
      {/* Preload all images */}
      <ImagePreloader imageUrls={allImageUrls} priority={true} />
      
      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-2 gap-8">
        {/* Left Column - Image and Variations */}
        <div className="space-y-6">
          <FundraiserImageCarousel
            images={getVariationImages(selectedVariation || defaultVariation?.id || '')}
            title={selectedVariationData?.title || fundraiser.title}
            onImageLoad={() => handleImageLoad()}
            isLoaded={imagesLoaded[selectedVariation || defaultVariation?.id || '']}
          />
          
          {fundraiser.fundraiser_variations && (
            <ProgressiveFundraiserVariations
              variations={fundraiser.fundraiser_variations}
              selectedVariation={selectedVariation}
              onVariationSelect={setSelectedVariation}
              imageUrls={variationImageUrls}
              imagesLoading={imagesLoading}
              loadedImages={imagesLoaded}
              onImageLoad={onImageLoad}
            />
          )}
        </div>

        {/* Right Column - Purchase Section */}
        <div className="space-y-6">
          {selectedVariationData && (
            <FundraiserPurchase
              price={selectedVariationData.price}
              quantity={quantity}
              onQuantityChange={handleQuantityChange}
              fundraiserId={fundraiser.id}
              variationId={selectedVariation || defaultVariation?.id || ''}
              productName={`${fundraiser.title} - ${selectedVariationData.title}`}
              imagePath={selectedVariationData.image_path}
              fundraiserTitle={fundraiser.title}
              variationTitle={selectedVariationData.title}
              schoolMode={fundraiser.school_mode || false}
              bigSchool={fundraiser.big_school || false}
              teacherList={(fundraiser.teacher_list as string[]) || []}
            />
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-6">
        {/* Product Image */}
        <FundraiserImageCarousel
          images={getVariationImages(selectedVariation || defaultVariation?.id || '')}
          title={selectedVariationData?.title || fundraiser.title}
          onImageLoad={() => handleImageLoad()}
          isLoaded={imagesLoaded[selectedVariation || defaultVariation?.id || '']}
        />
        
        {/* Variations */}
        {fundraiser.fundraiser_variations && (
          <ProgressiveFundraiserVariations
            variations={fundraiser.fundraiser_variations}
            selectedVariation={selectedVariation}
            onVariationSelect={setSelectedVariation}
            imageUrls={variationImageUrls}
            imagesLoading={imagesLoading}
            loadedImages={imagesLoaded}
            onImageLoad={onImageLoad}
          />
        )}
        
        {/* Purchase Section */}
        {selectedVariationData && (
          <FundraiserPurchase
            price={selectedVariationData.price}
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
            fundraiserId={fundraiser.id}
            variationId={selectedVariation || defaultVariation?.id || ''}
            productName={`${fundraiser.title} - ${selectedVariationData.title}`}
            imagePath={selectedVariationData.image_path}
            fundraiserTitle={fundraiser.title}
            variationTitle={selectedVariationData.title}
            schoolMode={fundraiser.school_mode || false}
            bigSchool={fundraiser.big_school || false}
            teacherList={(fundraiser.teacher_list as string[]) || []}
          />
        )}
      </div>
    </>
  );
};
