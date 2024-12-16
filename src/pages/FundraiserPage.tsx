import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { Skeleton } from "@/components/ui/skeleton";
import { FundraiserImages } from '@/components/fundraiser/FundraiserImages';
import { FundraiserVariations } from '@/components/fundraiser/FundraiserVariations';
import { FundraiserPurchase } from '@/components/fundraiser/FundraiserPurchase';

const FundraiserPage = () => {
  const { customLink } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { data: fundraiser, isLoading } = useQuery({
    queryKey: ['fundraiser', customLink],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fundraisers')
        .select(`
          *,
          fundraiser_variations (
            id,
            title,
            image_path,
            is_default
          ),
          fundraiser_orders (
            amount,
            donation_amount
          )
        `)
        .eq('custom_link', customLink)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const totalRaised = fundraiser?.total_raised || 0;

  const defaultVariation = fundraiser?.fundraiser_variations?.find(v => v.is_default);
  const selectedVariationData = fundraiser?.fundraiser_variations?.find(v => v.id === selectedVariation);

  React.useEffect(() => {
    if (defaultVariation && !selectedVariation) {
      setSelectedVariation(defaultVariation.id);
    }
  }, [defaultVariation]);

  const handleBuyNow = async () => {
    if (!fundraiser || !selectedVariation) return;

    const variation = fundraiser.fundraiser_variations.find(v => v.id === selectedVariation);
    if (!variation) return;

    const cartItem = {
      id: uuidv4(),
      product_name: `${fundraiser.title} - ${variation.title}`,
      price: fundraiser.base_price,
      quantity: quantity,
      image_path: variation.image_path
    };

    navigate('/checkout', { 
      state: { 
        cartItems: [cartItem],
        isLocalCart: true,
        isBuyNow: true,
        fundraiserId: fundraiser.id,
        variationId: variation.id
      } 
    });
  };

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
    return <div>Fundraiser not found</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4">{fundraiser.title}</h1>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800 text-lg font-semibold">
                Total Raised: ${totalRaised.toFixed(2)}
              </p>
              <p className="text-green-600">
                {fundraiser.donation_percentage}% of each sale is donated
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

              <FundraiserPurchase
                basePrice={fundraiser.base_price}
                quantity={quantity}
                onQuantityChange={(increment) => 
                  setQuantity(increment ? quantity + 1 : Math.max(1, quantity - 1))
                }
                onBuyNow={handleBuyNow}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundraiserPage;