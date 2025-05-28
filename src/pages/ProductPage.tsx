import React, { useState } from 'react';
import Navbar from "@/components/Navbar";
import { ProductImage } from '@/components/product/ProductImage';
import { ProductDetails } from '@/components/product/ProductDetails';
import { useProductForm } from '@/hooks/useProductForm';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-mobile';

const ProductPage = () => {
  const { toast } = useToast();
  const { uploadImage, isUploading } = useImageUpload();
  const [selectedChainColor, setSelectedChainColor] = useState("Designers' Choice");
  const isMobile = useIsMobile();
  
  const {
    teamName,
    setTeamName,
    teamLocation,
    setTeamLocation,
    imagePreview,
    quantity,
    handleQuantityChange,
    handleAddToCart,
    handleBuyNow,
    isAddingToCart,
    isProcessing
  } = useProductForm();

  // Fetch chain colors from database
  const { data: chainColors = [] } = useQuery({
    queryKey: ['chain-colors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_variations')
        .select('id, name, color')
        .eq('item_id', 'chain-colors');
      
      if (error) {
        console.error('Error fetching chain colors:', error);
        return [];
      }
      return data || [];
    },
  });

  const handleFileChange = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        
        try {
          const imageUrl = await uploadImage(dataUrl);
          console.log('Image uploaded successfully:', imageUrl);
          
          const { error: dbError } = await supabase
            .from('gallery_images')
            .insert({
              image_path: imageUrl,
              title: 'Custom Design Upload',
              description: 'User uploaded custom design'
            });
          
          if (dbError) {
            console.error('Error saving to gallery:', dbError);
          }
          
          toast({
            title: "Image uploaded",
            description: "Your design has been uploaded successfully",
          });
        } catch (error) {
          console.error('Upload failed:', error);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error handling file:', error);
      toast({
        title: "Error",
        description: "Failed to process image",
        variant: "destructive",
      });
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-lg mx-auto space-y-6">
            {/* 1. Custom Medallion, 17% off - same line with larger text */}
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Custom Medallion</h1>
              <div className="bg-red-500 text-white px-4 py-2 rounded-full text-xl font-bold whitespace-nowrap">
                17% OFF
              </div>
            </div>

            {/* 2. Gradient coloring disclaimer */}
            <p className="text-sm text-gray-600">
              Gradient coloring is not supported and will be modified by our designers if submitted
            </p>

            {/* 3. Images/Gallery */}
            <ProductImage
              imagePreview={imagePreview}
              onFileChange={handleFileChange}
              isUploading={isUploading}
              teamName={teamName}
              teamLocation={teamLocation}
              onTeamNameChange={setTeamName}
              onTeamLocationChange={setTeamLocation}
              isMobile={true}
            />

            {/* 5. No features section on mobile (skipped) */}

            {/* 6. Price, chain links color, quantity and buy now section */}
            <ProductDetails
              quantity={quantity}
              onQuantityChange={handleQuantityChange}
              onBuyNow={() => handleBuyNow(selectedChainColor)}
              onAddToCart={() => handleAddToCart(selectedChainColor)}
              isAddingToCart={isAddingToCart}
              isProcessing={isProcessing}
              chainColors={chainColors}
              selectedChainColor={selectedChainColor}
              onChainColorChange={setSelectedChainColor}
              isMobile={true}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left side - Product Image */}
            <div className="space-y-6">
              <ProductImage
                imagePreview={imagePreview}
                onFileChange={handleFileChange}
                isUploading={isUploading}
                teamName={teamName}
                teamLocation={teamLocation}
                onTeamNameChange={setTeamName}
                onTeamLocationChange={setTeamLocation}
              />
            </div>

            {/* Right side - Product Details */}
            <div className="space-y-6">
              <ProductDetails
                quantity={quantity}
                onQuantityChange={handleQuantityChange}
                onBuyNow={() => handleBuyNow(selectedChainColor)}
                onAddToCart={() => handleAddToCart(selectedChainColor)}
                isAddingToCart={isAddingToCart}
                isProcessing={isProcessing}
                chainColors={chainColors}
                selectedChainColor={selectedChainColor}
                onChainColorChange={setSelectedChainColor}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
