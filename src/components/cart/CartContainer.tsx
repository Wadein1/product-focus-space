import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { CartItem as CartItemType } from "@/types/cart";
import { CartList } from "./CartList";
import { CartSummary } from "./CartSummary";
import { EmptyCart } from "./EmptyCart";

export const CartContainer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCartItems = () => {
      const savedCart = localStorage.getItem('cartItems');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
      setIsLoading(false);
    };

    loadCartItems();
  }, []);

  const saveCartToLocalStorage = (items: CartItemType[]) => {
    localStorage.setItem('cartItems', JSON.stringify(items));
  };

  const handleQuantityChange = (itemId: string, currentQuantity: number, increment: boolean) => {
    const newQuantity = increment ? currentQuantity + 1 : Math.max(1, currentQuantity - 1);
    const updatedItems = cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    saveCartToLocalStorage(updatedItems);
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedItems);
    saveCartToLocalStorage(updatedItems);
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart",
    });
  };

  const handleCheckout = () => {
    navigate('/checkout', { 
      state: { 
        cartItems,
        isLocalCart: true 
      } 
    });
  };

  if (isLoading) {
    return <div className="text-center">Loading cart...</div>;
  }

  if (!cartItems || cartItems.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="space-y-8">
      <CartList 
        items={cartItems}
        onQuantityChange={handleQuantityChange}
        onRemove={handleRemoveItem}
      />
      <CartSummary 
        items={cartItems}
        onCheckout={handleCheckout}
      />
    </div>
  );
};