import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DesktopNav } from "./navigation/DesktopNav";
import { MobileNav } from "./navigation/MobileNav";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { data: cartItemsCount = 0, refetch: refetchCartCount } = useQuery({
    queryKey: ['cartItemsCount'],
    queryFn: async () => {
      try {
        // Get the most recent active cart
        const { data: carts, error: cartsError } = await supabase
          .from('shopping_carts')
          .select('id')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1);

        if (cartsError) {
          console.error('Error fetching cart:', cartsError);
          return 0;
        }

        // If no active cart exists, return 0
        if (!carts || carts.length === 0) {
          return 0;
        }

        // Get count of items in the cart
        const { count, error: countError } = await supabase
          .from('cart_items')
          .select('*', { count: 'exact', head: true })
          .eq('cart_id', carts[0].id);

        if (countError) {
          console.error('Error fetching cart items count:', countError);
          return 0;
        }

        return count || 0;
      } catch (error) {
        console.error('Unexpected error in cartItemsCount query:', error);
        return 0;
      }
    },
  });

  // Subscribe to real-time changes in cart_items
  useEffect(() => {
    const channel = supabase
      .channel('cart-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items'
        },
        () => {
          refetchCartCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchCartCount]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-semibold">
              Gimme Drip
            </Link>
          </div>

          <DesktopNav cartItemsCount={cartItemsCount} />
          <MobileNav 
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            cartItemsCount={cartItemsCount}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;