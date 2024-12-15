import Navbar from "@/components/Navbar";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductDetails } from "@/components/product/ProductDetails";
import { useProductForm } from "@/hooks/useProductForm";

const Product = () => {
  const {
    isAddingToCart,
    quantity,
    imagePreview,
    handleQuantityChange,
    handleFileChange,
    addToCart,
    buyNow
  } = useProductForm();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="grid md:grid-cols-2 gap-8">
          <ProductImage 
            imagePreview={imagePreview}
            onFileChange={handleFileChange}
          />
          <ProductDetails
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
            onAddToCart={addToCart}
            onBuyNow={buyNow}
            isAddingToCart={isAddingToCart}
          />
        </div>
      </div>
    </div>
  );
};

export default Product;