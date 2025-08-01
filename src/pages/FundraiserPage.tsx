
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
import { ShippingBanner } from "@/components/fundraiser/ShippingBanner";

const FundraiserPage = () => {
  const { customLink } = useParams();
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);

  const { fundraiser, fundraiserStats, isLoading, error } = useFundraiserData(customLink);
  
  const {
    isInitialLoading,
    isMobile,
    loadingProgress,
    imagesLoaded,
    markDataLoaded,
    markImageLoaded,
    markImageError,
  } = useMobileProgressiveLoading({
    maxLoadingTime: 2000, // Reduced from 3000 to 2000ms
    onDataLoaded: () => console.log('Progressive loading: Data ready for display'),
  });

  const defaultVariation = fundraiser?.fundraiser_variations?.find(v => v.is_default);
  
  // Check if shipping options are available
  const hasShippingOptions = (fundraiser?.allow_team_shipping || fundraiser?.allow_regular_shipping) ?? true;

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

  // Show error only if there's actually an error AND we're not loading
  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <FundraiserErrorState error={error} />
        </div>
      </div>
    );
  }

  // Show mobile loading screen only during initial load
  if (isMobile && isInitialLoading && isLoading) {
    return (
      <>
        <MobileLoadingScreen show={true} progress={loadingProgress} />
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
          <Navbar />
        </div>
      </>
    );
  }

  // Show loading state while data is being fetched
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

  // Only show "not found" if we have definitively determined there's no fundraiser
  if (!fundraiser && !isLoading && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <FundraiserErrorState />
        </div>
      </div>
    );
  }

  // Don't render content until we have fundraiser data
  if (!fundraiser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <FundraiserLoadingState />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <Navbar />
      <ShippingBanner show={!hasShippingOptions} />
      <div className={`container mx-auto px-4 pb-16 ${!hasShippingOptions ? 'pt-36' : 'pt-24'}`}>
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
            showProgressiveLoading={false} // Disable progressive loading for product switching
          />
        </div>
      </div>
    </div>
  );
};

export default FundraiserPage;
