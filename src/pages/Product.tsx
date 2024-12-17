import Navbar from "@/components/Navbar";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductDetails } from "@/components/product/ProductDetails";
import { useProductForm } from "@/hooks/useProductForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Product = () => {
  const {
    isAddingToCart,
    quantity,
    imagePreview,
    chainColors,
    selectedChainColor,
    setSelectedChainColor,
    handleQuantityChange,
    handleFileChange,
    addToCart,
  } = useProductForm();

  const { toast } = useToast();

  const handleBuyNow = async () => {
    try {
      const item = {
        product_name: `Custom Medallion (${selectedChainColor})`,
        price: 49.99,
        quantity: quantity,
        image_path: imagePreview || "/lovable-uploads/c3b67733-225f-4e30-9363-e13d20ed3100.png"
      };

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          items: [item],
          success_url: `${window.location.origin}/`,
          cancel_url: `${window.location.origin}/product`
        }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Failed to process checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

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
            onBuyNow={handleBuyNow}
            isAddingToCart={isAddingToCart}
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