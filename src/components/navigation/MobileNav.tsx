import { Link } from "react-router-dom";
import { Menu, X, ShoppingCart } from "lucide-react";

interface MobileNavProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

export const MobileNav = ({ isMenuOpen, setIsMenuOpen }: MobileNavProps) => {
  return (
    <>
      <div className="md:hidden flex items-center gap-4">
        <Link 
          to="/cart" 
          className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ShoppingCart className="h-6 w-6" />
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
    </>
  );
};