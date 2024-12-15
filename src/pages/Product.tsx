import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductDetails } from "@/components/product/ProductDetails";
import type { CartItem } from "@/types/cart";

const Product = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const addToCart = async () => {
    setIsAddingToCart(true);
    try {
      const newItem: CartItem = {
        id: uuidv4(),
        cart_id: uuidv4(), // Add cart_id as required by CartItem type
        product_name: "Custom Medallion",
        price: 49.99,
        quantity: quantity,
        image_path: imagePreview || "/lovable-uploads/c3b67733-225f-4e30-9363-e13d20ed3100.png"
      };

      // Get existing cart items from localStorage
      const existingCartJson = localStorage.getItem('cartItems');
      const existingCart = existingCartJson ? JSON.parse(existingCartJson) : [];
      
      // Add new item to cart
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
    try {
      const item: CartItem = {
        id: uuidv4(),
        cart_id: uuidv4(), // Add cart_id as required by CartItem type
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

  const handleFileChange = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleQuantityChange = (increment: boolean) => {
    setQuantity(prev => increment ? prev + 1 : Math.max(1, prev - 1));
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
            onBuyNow={buyNow}
            isAddingToCart={isAddingToCart}
          />
        </div>
      </div>
    </div>
  );
};

export default Product;