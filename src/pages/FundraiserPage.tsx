import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { Skeleton } from "@/components/ui/skeleton";

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
            image_path
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

  const totalRaised = fundraiser?.fundraiser_orders?.reduce(
    (sum, order) => sum + Number(order.donation_amount),
    0
  ) || 0;

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
            <div className="grid md:grid-cols-5 gap-8">
              <Skeleton className="col-span-3 aspect-square" />
              <div className="col-span-2 space-y-4">
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

          <div className="grid md:grid-cols-5 gap-8">
            {/* Main Product Image */}
            <div className="md:col-span-3">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={selectedVariationData?.image_path || defaultVariation?.image_path}
                  alt={selectedVariationData?.title || fundraiser.title}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
            </div>

            {/* Product Details and Variations */}
            <div className="md:col-span-2 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {fundraiser.fundraiser_variations?.map((variation) => (
                  <button
                    key={variation.id}
                    onClick={() => setSelectedVariation(variation.id)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedVariation === variation.id 
                        ? 'border-primary shadow-lg' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={variation.image_path}
                      alt={variation.title}
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                      <p className="text-white text-sm text-center truncate">
                        {variation.title}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <p className="text-lg text-gray-600">{fundraiser.description}</p>
                
                <div className="border-t border-b py-4">
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold">${fundraiser.base_price}</p>
                    <p className="text-sm text-gray-500">(+$8.00 shipping & 5% tax)</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">Quantity:</span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
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

                  <Button 
                    onClick={handleBuyNow}
                    className="w-full bg-primary text-white hover:bg-primary/90"
                  >
                    Buy Now
                  </Button>
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