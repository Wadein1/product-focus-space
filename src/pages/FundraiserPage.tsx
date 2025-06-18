
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFundraiserData } from "@/hooks/useFundraiserData";
import { FundraiserHeader } from "@/components/fundraiser/FundraiserHeader";
import { FundraiserContent } from "@/components/fundraiser/FundraiserContent";
import { FundraiserLoadingState } from "@/components/fundraiser/FundraiserLoadingState";
import { FundraiserErrorState } from "@/components/fundraiser/FundraiserErrorState";
import { getDonationText } from "@/utils/fundraiserUtils";

const FundraiserPage = () => {
  const { customLink } = useParams();
  const isMobile = useIsMobile();
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);

  const { fundraiser, fundraiserStats, isLoading, error } = useFundraiserData(customLink);

  // Add mobile debugging
  React.useEffect(() => {
    console.log('FundraiserPage loaded - Mobile detection:', isMobile);
    console.log('Custom link:', customLink);
    console.log('User agent:', navigator.userAgent);
  }, [isMobile, customLink]);

  const defaultVariation = fundraiser?.fundraiser_variations?.find(v => v.is_default);

  React.useEffect(() => {
    if (defaultVariation && !selectedVariation) {
      console.log('Setting default variation:', defaultVariation.id);
      setSelectedVariation(defaultVariation.id);
    }
  }, [defaultVariation, selectedVariation]);

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

  console.log('Rendering fundraiser page for:', fundraiser.title, 'Mobile:', isMobile);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <Navbar />
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
