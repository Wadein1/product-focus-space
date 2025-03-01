
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useImageUpload } from "@/hooks/useImageUpload";
import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/types/cart";

export const useProductForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { uploadImage, isUploading } = useImageUpload();
  
  const [quantity, setQuantity] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedChainColor, setSelectedChainColor] = useState("Designers' Choice");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamLocation, setTeamLocation] = useState("");

  const handleQuantityChange = (increment: boolean) => {
    setQuantity(prev => increment ? prev + 1 : Math.max(1, prev - 1));
  };

  const validateInput = () => {
    if (!imagePreview && (!teamName || !teamLocation)) {
      toast({
        title: "Required fields missing",
        description: "Please either upload an image OR enter team name and location",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleFileChange = async (file: File) => {
    try {
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
          // Clear team info when image is uploaded
          setTeamName("");
          setTeamLocation("");
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error handling file:', error);
      toast({
        title: "Error",
        description: "Failed to process the image",
        variant: "destructive",
      });
    }
  };

  const addToCart = async () => {
    if (!validateInput()) return;
    
    try {
      setIsAddingToCart(true);
      const cartItem: CartItem = {
        id: crypto.randomUUID(),
        cart_id: crypto.randomUUID(),
        product_name: 'Custom Medallion',
        price: 24.99,
        quantity,
        image_path: imagePreview || undefined,
        chain_color: selectedChainColor !== "Designers' Choice" ? selectedChainColor : undefined,
        is_fundraiser: false,
        team_name: teamName || undefined,
        team_location: teamLocation || undefined
      };

      const existingCartJson = localStorage.getItem('cartItems');
      const existingCart = existingCartJson ? JSON.parse(existingCartJson) : [];
      const updatedCart = [...existingCart, cartItem];
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));

      toast({
        title: "Added to cart",
        description: "The item has been added to your cart",
      });

      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const buyNow = async () => {
    if (!validateInput()) return;
    
    try {
      setIsProcessing(true);

      let finalImageUrl = imagePreview;
      if (imagePreview?.startsWith('data:')) {
        try {
          finalImageUrl = await uploadImage(imagePreview);
          console.log('Image uploaded successfully:', finalImageUrl);
        } catch (error) {
          console.error('Failed to upload image:', error);
          throw new Error('Failed to upload image');
        }
      }

      // Determine the design type based on whether we have an image or team info
      const designType = finalImageUrl ? 'custom_upload' : 'team_logo';
      
      // Always include all available metadata regardless of purchase type
      const metadata = {
        order_type: 'custom_medallion',
        chain_color: selectedChainColor,
        design_type: designType,
        ...(finalImageUrl && { image_url: finalImageUrl }),
        ...(teamName && { team_name: teamName }),
        ...(teamLocation && { team_location: teamLocation }),
      };

      console.log('Sending metadata to Stripe:', metadata);

      const { data: checkoutData, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: [{
            product_name: 'Custom Medallion',
            price: 24.99,
            quantity,
            image_path: finalImageUrl,
            chain_color: selectedChainColor,
            is_fundraiser: false,
            team_name: teamName || undefined,
            team_location: teamLocation || undefined
          }],
          metadata
        },
      });

      if (error) {
        console.error('Checkout error:', error);
        throw error;
      }

      if (!checkoutData?.url) {
        throw new Error('No checkout URL received from Stripe');
      }

      window.location.href = checkoutData.url;
    } catch (error) {
      console.error('Error processing checkout:', error);
      toast({
        title: "Error",
        description: "Failed to process checkout",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const chainColors = [
    { id: '2', name: 'Black' },
    { id: '3', name: 'White' },
    { id: '4', name: 'Red' },
    { id: '5', name: 'Blue' },
    { id: '6', name: 'Yellow' },
  ];

  return {
    quantity,
    imagePreview,
    chainColors,
    selectedChainColor,
    isAddingToCart,
    isProcessing,
    isUploading,
    teamName,
    teamLocation,
    setTeamName,
    setTeamLocation,
    setSelectedChainColor,
    handleQuantityChange,
    handleFileChange,
    addToCart,
    buyNow,
  };
};
