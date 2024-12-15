import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import type { CartItem } from "@/types/cart";

export const useProductForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const validateImage = () => {
    if (!imagePreview) {
      toast({
        title: "Image required",
        description: "Please upload an image before adding to cart",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleQuantityChange = (increment: boolean) => {
    setQuantity(prev => increment ? prev + 1 : Math.max(1, prev - 1));
  };

  const handleFileChange = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addToCart = async () => {
    if (!validateImage()) return;

    setIsAddingToCart(true);
    try {
      const newItem: CartItem = {
        id: uuidv4(),
        cart_id: uuidv4(),
        product_name: "Custom Medallion",
        price: 49.99,
        quantity: quantity,
        image_path: imagePreview || "/lovable-uploads/c3b67733-225f-4e30-9363-e13d20ed3100.png"
      };

      const existingCartJson = localStorage.getItem('cartItems');
      const existingCart = existingCartJson ? JSON.parse(existingCartJson) : [];
      const updatedCart = [...existingCart, newItem];
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));

      toast({
        title: "Added to cart",
        description: "The item has been added to your cart",
      });
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
    if (!validateImage()) return;

    try {
      const item: CartItem = {
        id: uuidv4(),
        cart_id: uuidv4(),
        product_name: "Custom Medallion",
        price: 49.99,
        quantity: quantity,
        image_path: imagePreview || "/lovable-uploads/c3b67733-225f-4e30-9363-e13d20ed3100.png"
      };

      navigate('/checkout', { 
        state: { 
          cartItems: [item],
          isLocalCart: true,
          isBuyNow: true 
        } 
      });
    } catch (error) {
      console.error('Error processing buy now:', error);
      toast({
        title: "Error",
        description: "Failed to process purchase",
        variant: "destructive",
      });
    }
  };

  return {
    isAddingToCart,
    quantity,
    imagePreview,
    handleQuantityChange,
    handleFileChange,
    addToCart,
    buyNow
  };
};