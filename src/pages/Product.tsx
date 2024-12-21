import Navbar from "@/components/Navbar";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductDetails } from "@/components/product/ProductDetails";
import { useProductForm } from "@/hooks/useProductForm";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

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
    uploadProgress,
    isUploading
  } = useProductForm();

  return (
    <div className="min-h-screen bg-white">
      <LoadingOverlay 
        show={isUploading || isProcessing} 
        progress={isUploading ? uploadProgress : isProcessing ? 100 : 0}
        message={isUploading ? "Uploading image..." : "Processing your order..."}
      />
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="grid md:grid-cols-2 gap-8">
          <ProductImage 
            imagePreview={imagePreview}
            onFileChange={handleFileChange}
            uploadProgress={uploadProgress}
            isUploading={isUploading}
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