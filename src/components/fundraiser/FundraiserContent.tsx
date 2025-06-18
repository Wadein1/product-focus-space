
import React, { useState } from 'react';
import { FundraiserImages } from './FundraiserImages';
import { FundraiserVariations } from './FundraiserVariations';
import { FundraiserPurchase } from './FundraiserPurchase';

interface FundraiserContentProps {
  fundraiser: any;
  defaultVariation: any;
  selectedVariation: string | null;
  setSelectedVariation: (id: string) => void;
}

export const FundraiserContent = ({
  fundraiser,
  defaultVariation,
  selectedVariation,
  setSelectedVariation,
}: FundraiserContentProps) => {
  const [quantity, setQuantity] = useState(1);

  const selectedVariationData = fundraiser?.fundraiser_variations?.find(v => v.id === selectedVariation);

  const handleQuantityChange = (increment: boolean) => {
    setQuantity(increment ? quantity + 1 : Math.max(1, quantity - 1));
  };

  if (!fundraiser) return null;

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-2 gap-8">
        {/* Left Column - Image and Variations */}
        <div className="space-y-6">
          <FundraiserImages
            mainImage={selectedVariationData?.image_path || defaultVariation?.image_path}
            title={selectedVariationData?.title || fundraiser.title}
          />
          
          {fundraiser.fundraiser_variations && (
            <FundraiserVariations
              variations={fundraiser.fundraiser_variations}
              selectedVariation={selectedVariation}
              onVariationSelect={setSelectedVariation}
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
        />
        
        {/* Variations */}
        {fundraiser.fundraiser_variations && (
          <FundraiserVariations
            variations={fundraiser.fundraiser_variations}
            selectedVariation={selectedVariation}
            onVariationSelect={setSelectedVariation}
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
