
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import { useFundraiserData } from "@/hooks/useFundraiserData";
import { FundraiserHeader } from "@/components/fundraiser/FundraiserHeader";
import { FundraiserContent } from "@/components/fundraiser/FundraiserContent";
import { FundraiserLoadingState } from "@/components/fundraiser/FundraiserLoadingState";
import { FundraiserErrorState } from "@/components/fundraiser/FundraiserErrorState";
import { ImagePreloader } from "@/components/fundraiser/ImagePreloader";
import { getDonationText } from "@/utils/fundraiserUtils";
import { supabase } from "@/integrations/supabase/client";

const FundraiserPage = () => {
  const { customLink } = useParams();
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);

  const { fundraiser, fundraiserStats, isLoading, error } = useFundraiserData(customLink);

  const defaultVariation = fundraiser?.fundraiser_variations?.find(v => v.is_default);

  React.useEffect(() => {
    if (defaultVariation && !selectedVariation) {
      console.log('Setting default variation:', defaultVariation.id);
      setSelectedVariation(defaultVariation.id);
    }
  }, [defaultVariation, selectedVariation]);

  // Prepare image URLs for preloading
  const imageUrls = React.useMemo(() => {
    if (!fundraiser?.fundraiser_variations) return [];
    
    return fundraiser.fundraiser_variations
      .filter(v => v.image_path)
      .slice(0, 3) // Preload only first 3 images
      .map(v => {
        const { data: { publicUrl } } = supabase
          .storage
          .from('gallery')
          .getPublicUrl(v.image_path);
        return publicUrl;
      });
  }, [fundraiser?.fundraiser_variations]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <FundraiserErrorState error={error} />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <FundraiserLoadingState />
        </div>
      </div>
    );
  }

  if (!fundraiser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <FundraiserErrorState />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <Navbar />
      <ImagePreloader imageUrls={imageUrls} priority />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          <FundraiserHeader
            title={fundraiser.title}
            donationText={getDonationText(fundraiser, fundraiserStats)}
          />

          <FundraiserContent
            fundraiser={fundraiser}
            defaultVariation={defaultVariation}
            selectedVariation={selectedVariation}
            setSelectedVariation={setSelectedVariation}
          />
        </div>
      </div>
    </div>
  );
};

export default FundraiserPage;
