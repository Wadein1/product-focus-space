import { useState, useEffect } from "react";
import { Menu, X, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { data: cartItemsCount = 0 } = useQuery({
    queryKey: ['cartItemsCount'],
    queryFn: async () => {
      try {
        // Get the most recent active cart
        const { data: carts, error: cartsError } = await supabase
          .from('shopping_carts')
          .select('id')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single(); // This ensures we get a single object or null

        if (cartsError) {
          if (cartsError.code === 'PGRST116') {
            // No active cart exists
            return 0;
          }
          console.error('Error fetching cart:', cartsError);
          return 0;
        }

        // If no active cart exists, return 0
        if (!carts) {
          return 0;
        }

        // Get count of items in the cart
        const { count, error: countError } = await supabase
          .from('cart_items')
          .select('*', { count: 'exact', head: true })
          .eq('cart_id', carts.id);

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
    // Refresh every minute to keep count updated
    refetchInterval: 60000,
  });

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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/fundraising" className="nav-link">
              Fundraising
            </Link>
            <Link to="/support" className="nav-link">
              Support
            </Link>
            <Link to="/product" className="button-primary">
              Buy Now
            </Link>
            <Link 
              to="/cart" 
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <Link 
              to="/cart" 
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg">
              <Link
                to="/fundraising"
                className="block px-3 py-2 rounded-md text-base font-medium hover:text-primary transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Fundraising
              </Link>
              <Link
                to="/support"
                className="block px-3 py-2 rounded-md text-base font-medium hover:text-primary transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Support
              </Link>
              <Link
                to="/product"
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium button-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Buy Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;