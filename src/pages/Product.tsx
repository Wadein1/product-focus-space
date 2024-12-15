import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductImage } from '@/components/product/ProductImage';
import { ProductDetails } from '@/components/product/ProductDetails';

const Product = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addToCartForCheckout = async () => {
    if (!selectedFile) {
      throw new Error("Please upload an image for your medallion");
    }

    const { data: newCart, error: cartError } = await supabase
      .from('shopping_carts')
      .insert([{ 
        status: 'active',
        last_activity: new Date().toISOString()
      }])
      .select()
      .single();

    if (cartError) throw cartError;

    const { error: addError } = await supabase
      .from('cart_items')
      .insert([{
        cart_id: newCart.id,
        product_name: 'Custom Medallion',
        price: 49.99,
        quantity: quantity,
        image_path: imagePreview
      }]);

    if (addError) throw addError;
    
    return newCart.id;
  };

  const buyNowMutation = useMutation({
    mutationFn: addToCartForCheckout,
    onSuccess: (cartId) => {
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
      navigate('/checkout', { state: { cartId, isBuyNow: true } });
    },
    onError: (error: Error) => {
      console.error('Error processing buy now:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process purchase",
        variant: "destructive"
      });
    }
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) {
        throw new Error("Please upload an image for your medallion");
      }

      const { data: existingCarts, error: cartError } = await supabase
        .from('shopping_carts')
        .select('id')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (cartError && cartError.code !== 'PGRST116') {
        throw cartError;
      }

      let cartId;

      if (!existingCarts) {
        const { data: newCart, error: createError } = await supabase
          .from('shopping_carts')
          .insert([{ status: 'active' }])
          .select()
          .single();

        if (createError) throw createError;
        cartId = newCart.id;
      } else {
        cartId = existingCarts.id;
      }

      const { error: addError } = await supabase
        .from('cart_items')
        .insert([{
          cart_id: cartId,
          product_name: 'Custom Medallion',
          price: 49.99,
          quantity: quantity,
          image_path: imagePreview
        }]);

      if (addError) throw addError;
      return cartId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
      toast({
        title: "Added to cart",
        description: "Your medallion has been added to the cart"
      });
    },
    onError: (error: Error) => {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive"
      });
    }
  });

  const handleQuantityChange = (increment: boolean) => {
    setQuantity(prev => {
      const newValue = increment ? prev + 1 : prev - 1;
      return Math.max(1, newValue);
    });
  };

  const handleBuyNow = () => {
    if (!selectedFile) {
      toast({
        title: "Missing image",
        description: "Please upload an image for your medallion",
        variant: "destructive"
      });
      return;
    }
    buyNowMutation.mutate();
  };

  const handleAddToCart = () => {
    addToCartMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <ProductImage 
            imagePreview={imagePreview}
            onFileChange={handleFileChange}
          />
          <ProductDetails 
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
            onBuyNow={handleBuyNow}
            onAddToCart={handleAddToCart}
            isAddingToCart={addToCartMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
};

export default Product;