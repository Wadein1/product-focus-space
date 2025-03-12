
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductDetails } from "@/components/product/ProductDetails";
import { useProductForm } from "@/hooks/useProductForm";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { AnimatedText } from "@/components/animations/AnimatedText";

const Product = () => {
  const [animationComplete, setAnimationComplete] = useState(false);
  
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

  useEffect(() => {
    // Set body background to black during animation
    document.body.classList.add("bg-black");
    
    // Reset background when animation completes or component unmounts
    return () => {
      document.body.classList.remove("bg-black");
    };
  }, []);
  
  const handleAnimationComplete = () => {
    setAnimationComplete(true);
    // Reset body background
    document.body.classList.remove("bg-black");
  };

  return (
    <div className="min-h-screen bg-black transition-colors duration-1000" 
         style={{ backgroundColor: animationComplete ? "white" : "black" }}>
      {!animationComplete ? (
        <AnimatedText onAnimationComplete={handleAnimationComplete} />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default Product;
