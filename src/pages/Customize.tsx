
import React from "react";
import { useProductForm } from "@/hooks/useProductForm";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductDetails } from "@/components/product/ProductDetails";

const Customize = () => {
  const productForm = useProductForm();
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Customize Your Medallion</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ProductImage 
          imagePreview={productForm.imagePreview}
          onFileChange={productForm.handleFileChange}
          isUploading={productForm.isUploading}
          teamName={productForm.teamName}
          teamLocation={productForm.teamLocation}
          onTeamNameChange={productForm.setTeamName}
          onTeamLocationChange={productForm.setTeamLocation}
        />
        
        <ProductDetails 
          quantity={productForm.quantity}
          onQuantityChange={productForm.handleQuantityChange}
          selectedChainColor={productForm.selectedChainColor}
          onChainColorChange={productForm.setSelectedChainColor}
          chainColors={productForm.chainColors}
          onAddToCart={productForm.addToCart}
          onBuyNow={productForm.buyNow}
          isAddingToCart={productForm.isAddingToCart}
          isProcessing={productForm.isProcessing}
        />
      </div>
    </div>
  );
};

export default Customize;
