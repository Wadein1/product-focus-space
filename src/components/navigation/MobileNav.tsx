
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
        <div className="md:hidden absolute top-16 left-0 right-0 z-50">
          <div className="mx-4 p-4 space-y-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-100">
            <Link
              to="/about"
              className="block w-full px-4 py-2 text-left rounded-md text-base font-medium hover:bg-gray-50 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/fundraising"
              className="block w-full px-4 py-2 text-left rounded-md text-base font-medium hover:bg-gray-50 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Fundraising
            </Link>
            <Link
              to="/support"
              className="block w-full px-4 py-2 text-left rounded-md text-base font-medium hover:bg-gray-50 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Support
            </Link>
            <Link
              to="/product"
              className="block w-full px-4 py-2 text-left rounded-md text-base font-medium bg-primary text-white hover:bg-primary/90 transition-colors duration-200"
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
