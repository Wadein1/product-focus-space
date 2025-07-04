
import React, { useState } from 'react';
import { FundraiserImages } from './FundraiserImages';
import { FundraiserVariations } from './FundraiserVariations';
import { FundraiserPurchase } from './FundraiserPurchase';
import { ImagePreloader } from './ImagePreloader';
import { useImageBatch } from '@/hooks/useImageBatch';
import { supabase } from "@/integrations/supabase/client";

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
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);

  const selectedVariationData = fundraiser?.fundraiser_variations?.find(v => v.id === selectedVariation);

  // Prepare image paths for batch loading
  const imagePaths = React.useMemo(() => {
    if (!fundraiser?.fundraiser_variations) return [];
    
    return fundraiser.fundraiser_variations.map((variation: any) => ({
      id: variation.id,
      path: variation.image_path
    })).filter((item: any) => item.path);
  }, [fundraiser?.fundraiser_variations]);

  const { images, loading: imagesLoading } = useImageBatch(imagePaths);

  // Preload all images immediately for better performance
  const allImageUrls = React.useMemo(() => {
    return Object.values(images).map(imageData => imageData.url).filter(Boolean);
  }, [images]);

  // Load main image URL
  React.useEffect(() => {
    const mainImagePath = selectedVariationData?.image_path || defaultVariation?.image_path;
    if (mainImagePath) {
      const { data: { publicUrl } } = supabase
        .storage
        .from('gallery')
        .getPublicUrl(mainImagePath);
      setMainImageUrl(publicUrl);
    }
  }, [selectedVariationData?.image_path, defaultVariation?.image_path]);

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

  // Extract image URLs for variations
  const variationImageUrls = Object.fromEntries(
    Object.entries(images).map(([id, imageData]) => [id, imageData.url])
  );

  return (
    <>
      {/* Preload all images */}
      <ImagePreloader imageUrls={allImageUrls} priority={true} />
      
      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-2 gap-8">
        {/* Left Column - Image and Variations */}
        <div className="space-y-6">
          <FundraiserImages
            mainImage={selectedVariationData?.image_path || defaultVariation?.image_path}
            title={selectedVariationData?.title || fundraiser.title}
            imageUrl={mainImageUrl}
            onImageLoad={() => handleImageLoad()}
          />
          
          {fundraiser.fundraiser_variations && (
            <FundraiserVariations
              variations={fundraiser.fundraiser_variations}
              selectedVariation={selectedVariation}
              onVariationSelect={setSelectedVariation}
              imageUrls={variationImageUrls}
              imagesLoading={imagesLoading}
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
            />
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-6">
        {/* Product Image */}
        <FundraiserImages
          mainImage={selectedVariationData?.image_path || defaultVariation?.image_path}
          title={selectedVariationData?.title || fundraiser.title}
          imageUrl={mainImageUrl}
          onImageLoad={() => handleImageLoad()}
        />
        
        {/* Variations */}
        {fundraiser.fundraiser_variations && (
          <FundraiserVariations
            variations={fundraiser.fundraiser_variations}
            selectedVariation={selectedVariation}
            onVariationSelect={setSelectedVariation}
            imageUrls={variationImageUrls}
            imagesLoading={imagesLoading}
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
          />
        )}
      </div>
    </>
  );
};
