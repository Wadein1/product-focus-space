
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
          className="relative p-2 hover:bg-gray-700 rounded-full transition-colors"
        >
          <ShoppingCart className="h-6 w-6 text-foreground" />
        </Link>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-foreground hover:text-primary focus:outline-none"
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
          <div className="mx-4 p-4 space-y-3 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border border-border">
            <Link
              to="/about"
              className="block w-full px-4 py-2 text-left rounded-md text-base font-medium text-foreground hover:bg-secondary hover:text-foreground transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/fundraising"
              className="block w-full px-4 py-2 text-left rounded-md text-base font-medium text-foreground hover:bg-secondary hover:text-foreground transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Fundraising
            </Link>
            <Link
              to="/support"
              className="block w-full px-4 py-2 text-left rounded-md text-base font-medium text-foreground hover:bg-secondary hover:text-foreground transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Support
            </Link>
            <Link
              to="/product"
              className="block w-full px-4 py-2 text-left rounded-md text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
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
