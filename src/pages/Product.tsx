
import React from "react";
import Navbar from "@/components/Navbar";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductDetails } from "@/components/product/ProductDetails";
import { useProductForm } from "@/hooks/useProductForm";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { LogoAnimation } from "@/components/product/LogoAnimation";

const Product = () => {
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

  return (
    <div className="min-h-screen bg-white">
      <LogoAnimation />
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
