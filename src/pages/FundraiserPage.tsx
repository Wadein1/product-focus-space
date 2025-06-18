
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { FundraiserImages } from '@/components/fundraiser/FundraiserImages';
import { FundraiserVariations } from '@/components/fundraiser/FundraiserVariations';
import { FundraiserPurchase } from '@/components/fundraiser/FundraiserPurchase';
import { useIsMobile } from "@/hooks/use-mobile";

const FundraiserPage = () => {
  const { customLink } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Add mobile debugging
  React.useEffect(() => {
    console.log('FundraiserPage loaded - Mobile detection:', isMobile);
    console.log('Custom link:', customLink);
    console.log('User agent:', navigator.userAgent);
  }, [isMobile, customLink]);

  const { data: fundraiser, isLoading, error } = useQuery({
    queryKey: ['fundraiser', customLink],
    queryFn: async () => {
      console.log('Fetching fundraiser data for:', customLink);
      const { data, error } = await supabase
        .from('fundraisers')
        .select(`
          *,
          fundraiser_variations (
            id,
            title,
            image_path,
            is_default,
            price
          )
        `)
        .eq('custom_link', customLink)
        .single();

      if (error) {
        console.error('Fundraiser fetch error:', error);
        throw error;
      }
      console.log('Fundraiser data loaded:', data);
      return data;
    },
    retry: 3,
    retryDelay: 1000,
  });

  // Get fundraiser stats from fundraiser_totals table (updated by trigger)
  const { data: fundraiserStats } = useQuery({
    queryKey: ['fundraiser-stats', fundraiser?.id],
    queryFn: async () => {
      if (!fundraiser?.id) return null;
      
      console.log('Fetching fundraiser stats for:', fundraiser.id);
      const { data, error } = await supabase
        .from('fundraiser_totals')
        .select('total_items_sold, total_raised')
        .eq('fundraiser_id', fundraiser.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching fundraiser stats:', error);
        return { total_items_sold: 0, total_raised: 0 };
      }

      console.log('Fundraiser stats loaded:', data);
      return data || { total_items_sold: 0, total_raised: 0 };
    },
    enabled: !!fundraiser?.id,
    refetchInterval: 10000,
  });

  const defaultVariation = fundraiser?.fundraiser_variations?.find(v => v.is_default);
  const selectedVariationData = fundraiser?.fundraiser_variations?.find(v => v.id === selectedVariation);

  React.useEffect(() => {
    if (defaultVariation && !selectedVariation) {
      console.log('Setting default variation:', defaultVariation.id);
      setSelectedVariation(defaultVariation.id);
    }
  }, [defaultVariation, selectedVariation]);

  if (error) {
    console.error('FundraiserPage error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Fundraiser not found</h1>
            <p className="text-gray-400 mb-4">
              {isMobile ? 'Mobile device detected' : 'Desktop device detected'}
            </p>
            <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
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
            {isMobile && (
              <div className="mt-4 text-center text-sm text-gray-400">
                Loading on mobile device...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!fundraiser) {
    console.error('No fundraiser data available');
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Fundraiser not found</h1>
            <p className="text-gray-400 mb-4">
              Device: {isMobile ? 'Mobile' : 'Desktop'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getDonationText = () => {
    if (!fundraiser) return '';
    
    let donationText = '';
    if (fundraiser.donation_type === 'percentage') {
      donationText = `${fundraiser.donation_percentage}% of each item purchase (excluding shipping) is donated to ${fundraiser.title}`;
    } else {
      const donationAmount = fundraiser.donation_amount || 0;
      donationText = `$${donationAmount.toFixed(2)} of each item bought is donated to ${fundraiser.title}`;
    }
    
    const totalRaised = fundraiserStats?.total_raised || 0;
    
    return `${donationText}, $${totalRaised.toFixed(2)} raised so far!`;
  };

  console.log('Rendering fundraiser page for:', fundraiser.title, 'Mobile:', isMobile);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4 text-foreground">{fundraiser.title}</h1>
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
              <p className="text-green-400 font-medium">
                {getDonationText()}
              </p>
            </div>
          </div>

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
                  onQuantityChange={(increment) => 
                    setQuantity(increment ? quantity + 1 : Math.max(1, quantity - 1))
                  }
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
                onQuantityChange={(increment) => 
                  setQuantity(increment ? quantity + 1 : Math.max(1, quantity - 1))
                }
                fundraiserId={fundraiser.id}
                variationId={selectedVariation || defaultVariation?.id || ''}
                productName={`${fundraiser.title} - ${selectedVariationData.title}`}
                imagePath={selectedVariationData.image_path}
              />
            )}
            
            {/* Mobile Debug Info */}
            {isMobile && (
              <div className="mt-4 p-2 bg-gray-800 rounded text-xs text-gray-300">
                <p>Mobile Debug: Page loaded successfully</p>
                <p>Variations: {fundraiser.fundraiser_variations?.length || 0}</p>
                <p>Selected: {selectedVariation || 'none'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundraiserPage;
