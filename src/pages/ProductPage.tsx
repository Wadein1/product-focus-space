
import React, { useState } from 'react';
import Navbar from "@/components/Navbar";
import { ProductImage } from '@/components/product/ProductImage';
import { ProductDetails } from '@/components/product/ProductDetails';
import { useProductForm } from '@/hooks/useProductForm';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';

const ProductPage = () => {
  const { toast } = useToast();
  const { uploadImage, isUploading } = useImageUpload();
  const [selectedChainColor, setSelectedChainColor] = useState("Designers' Choice");
  
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
        .eq('item_id', 'chain-colors'); // Assuming you have chain colors in inventory
      
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
        
        // Upload to Supabase storage
        try {
          const imageUrl = await uploadImage(dataUrl);
          console.log('Image uploaded successfully:', imageUrl);
          
          // Also save to gallery_images table
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
