import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MinusIcon, PlusIcon } from 'lucide-react';

const Product = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive"
        });
      }
    }
  };

  const addToCartForCheckout = async () => {
    if (!selectedFile) {
      throw new Error("Please upload an image for your medallion");
    }

    // Create a new cart specifically for this purchase
    const { data: newCart, error: cartError } = await supabase
      .from('shopping_carts')
      .insert([{ 
        status: 'active',
        last_activity: new Date().toISOString()
      }])
      .select()
      .single();

    if (cartError) throw cartError;

    // Add item to the new cart
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
      // Navigate to checkout with the specific cart ID
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

      // First, try to find an active cart
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

      // If no active cart exists, create one
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

      // Add item to cart with quantity
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src="/lovable-uploads/c3b67733-225f-4e30-9363-e13d20ed3100.png"
                  alt="Product"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Upload Your Design
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full"
              />
              <p className="text-sm text-gray-500">
                Upload the image you want on your medallion
              </p>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight">Custom Medallion</h1>
            <p className="text-lg text-gray-600">
              Gradient coloring is not supported and will be modified by our designers if submitted
            </p>
            <div className="border-t border-b py-4">
              <h2 className="text-xl font-semibold mb-2">Features:</h2>
              <ul className="space-y-2 text-gray-600">
                <li>• Premium quality materials</li>
                <li>• 10 Inch design</li>
                <li>• Custom designed and made</li>
              </ul>
            </div>
            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">$49.99</p>
                <p className="text-sm text-gray-500">(+$8.00 shipping & 5% tax)</p>
              </div>
              
              {/* Quantity Selector */}
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(false)}
                    disabled={quantity <= 1}
                  >
                    <MinusIcon className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(true)}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleBuyNow}
                  className="w-full bg-primary text-white hover:bg-primary/90"
                >
                  Buy Now
                </Button>
                <Button 
                  onClick={addToCartMutation.mutate}
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary/10"
                  disabled={addToCartMutation.isPending}
                >
                  {addToCartMutation.isPending ? 'Adding to Cart...' : 'Add to Cart'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
