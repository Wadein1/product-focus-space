
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductDetails } from "@/components/product/ProductDetails";
import { useProductForm } from "@/hooks/useProductForm";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import LogoAnimation from "@/components/product/LogoAnimation";

const Product = () => {
  const [showAnimation, setShowAnimation] = useState(true);
  
  const {
    isAddingToCart,
    isProcessing,
    quantity,
    imagePreview,
    chainColors,
    selectedChainColor,
    setSelectedChainColor,
    handleQuantityChange,
    handleFileChange,
    addToCart,
    buyNow,
    isUploading,
    teamName,
    teamLocation,
    setTeamName,
    setTeamLocation
  } = useProductForm();

  // Handle animation completion
  const handleAnimationComplete = () => {
    setShowAnimation(false);
  };

  // If animation is shown, display only the animation component
  if (showAnimation) {
    return <LogoAnimation onAnimationComplete={handleAnimationComplete} />;
  }

  // After animation completes, show the normal product page
  return (
    <div className="min-h-screen bg-white">
      <LoadingOverlay 
        show={isUploading || isProcessing} 
        message={isUploading ? "Uploading image..." : "Processing your order..."}
      />
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="grid md:grid-cols-2 gap-8">
          <ProductImage 
            imagePreview={imagePreview}
            onFileChange={handleFileChange}
            isUploading={isUploading}
            teamName={teamName}
            teamLocation={teamLocation}
            onTeamNameChange={setTeamName}
            onTeamLocationChange={setTeamLocation}
          />
          <ProductDetails
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
            onAddToCart={addToCart}
            onBuyNow={buyNow}
            isAddingToCart={isAddingToCart}
            isProcessing={isProcessing}
            chainColors={chainColors}
            selectedChainColor={selectedChainColor}
            onChainColorChange={setSelectedChainColor}
          />
        </div>
      </div>
    </div>
  );
};

export default Product;
