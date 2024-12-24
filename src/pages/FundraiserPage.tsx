import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FundraiserImages } from '@/components/fundraiser/FundraiserImages';
import { FundraiserVariations } from '@/components/fundraiser/FundraiserVariations';
import { FundraiserPurchase } from '@/components/fundraiser/FundraiserPurchase';
import type { CartItem } from "@/types/cart";

const FundraiserPage = () => {
  const { customLink } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { data: fundraiser, isLoading, error } = useQuery({
    queryKey: ['fundraiser', customLink],
    queryFn: async () => {
      console.log('Fetching fundraiser with custom link:', customLink);
      const { data, error } = await supabase
        .from('fundraisers')
        .select(`
          *,
          fundraiser_variations (
            id,
            title,
            image_path,
            is_default
          )
        `)
        .eq('custom_link', customLink)
        .maybeSingle();

      if (error) {
        console.error('Error fetching fundraiser:', error);
        throw error;
      }
      
      if (!data) {
        console.log('No fundraiser found with custom link:', customLink);
        return null;
      }

      console.log('Found fundraiser:', data);
      return data;
    },
  });

  const defaultVariation = fundraiser?.fundraiser_variations?.find(v => v.is_default);
  const selectedVariationData = fundraiser?.fundraiser_variations?.find(v => v.id === selectedVariation);

  React.useEffect(() => {
    if (defaultVariation && !selectedVariation) {
      setSelectedVariation(defaultVariation.id);
    }
  }, [defaultVariation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-24 w-full mb-8" />
            <div className="grid md:grid-cols-2 gap-8">
              <Skeleton className="aspect-square" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!fundraiser) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Fundraiser Not Found</h1>
            <p className="text-gray-600 mb-8">
              The fundraiser you're looking for doesn't exist or may have been removed.
            </p>
            <Button onClick={() => navigate('/fundraising')}>
              View All Fundraisers
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getDonationText = () => {
    if (fundraiser.donation_type === 'percentage') {
      return `${fundraiser.donation_percentage}% of each sale is donated`;
    } else {
      return `$${fundraiser.donation_amount.toFixed(2)} from each sale is donated`;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4">{fundraiser.title}</h1>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-600">
                {getDonationText()}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <FundraiserImages
              mainImage={selectedVariationData?.image_path || defaultVariation?.image_path}
              title={selectedVariationData?.title || fundraiser.title}
            />

            <div className="space-y-6">
              <p className="text-lg text-gray-600">{fundraiser.description}</p>
              
              {fundraiser.fundraiser_variations && (
                <FundraiserVariations
                  variations={fundraiser.fundraiser_variations}
                  selectedVariation={selectedVariation}
                  onVariationSelect={setSelectedVariation}
                />
              )}

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div>
                  <FundraiserPurchase
                    basePrice={fundraiser.base_price}
                    quantity={quantity}
                    onQuantityChange={(increment) => 
                      setQuantity(increment ? quantity + 1 : Math.max(1, quantity - 1))
                    }
                    fundraiserId={fundraiser.id}
                    variationId={selectedVariation || defaultVariation?.id || ''}
                    productName={`${fundraiser.title} - ${selectedVariationData?.title || defaultVariation?.title || ''}`}
                    imagePath={selectedVariationData?.image_path || defaultVariation?.image_path}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundraiserPage;