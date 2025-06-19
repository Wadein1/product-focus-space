
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import { useFundraiserData } from "@/hooks/useFundraiserData";
import { FundraiserHeader } from "@/components/fundraiser/FundraiserHeader";
import { FundraiserContent } from "@/components/fundraiser/FundraiserContent";
import { FundraiserLoadingState } from "@/components/fundraiser/FundraiserLoadingState";
import { FundraiserErrorState } from "@/components/fundraiser/FundraiserErrorState";
import { MobileLoadingScreen } from "@/components/fundraiser/MobileLoadingScreen";
import { useMobileProgressiveLoading } from "@/hooks/useMobileProgressiveLoading";
import { getDonationText } from "@/utils/fundraiserUtils";

const FundraiserPage = () => {
  const { customLink } = useParams();
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);

  const { fundraiser, fundraiserStats, isLoading, error } = useFundraiserData(customLink);
  
  const {
    isInitialLoading,
    showContent,
    isMobile,
    loadingProgress,
    imagesLoaded,
    markDataLoaded,
    markImageLoaded,
    markImageError,
  } = useMobileProgressiveLoading({
    maxLoadingTime: 3000,
    onDataLoaded: () => console.log('Progressive loading: Data ready for display'),
  });

  const defaultVariation = fundraiser?.fundraiser_variations?.find(v => v.is_default);

  React.useEffect(() => {
    if (defaultVariation && !selectedVariation) {
      console.log('Setting default variation:', defaultVariation.id);
      setSelectedVariation(defaultVariation.id);
    }
  }, [defaultVariation, selectedVariation]);

  // Mark data as loaded when fundraiser data is ready
  React.useEffect(() => {
    if (fundraiser && !isLoading && !error) {
      console.log('Fundraiser data loaded, marking data ready');
      markDataLoaded();
    }
  }, [fundraiser, isLoading, error, markDataLoaded]);

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

  // Show mobile loading screen
  if (isMobile && isInitialLoading) {
    return (
      <>
        <MobileLoadingScreen show={true} progress={loadingProgress} />
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
          <Navbar />
        </div>
      </>
    );
  }

  // Desktop loading or mobile after initial load
  if (isLoading && !showContent) {
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
            imagesLoaded={imagesLoaded}
            onImageLoad={markImageLoaded}
            onImageError={markImageError}
            showProgressiveLoading={isMobile}
          />
        </div>
      </div>
    </div>
  );
};

export default FundraiserPage;
