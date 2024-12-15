import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

interface DesktopNavProps {
  cartItemsCount: number;
}

export const DesktopNav = ({ cartItemsCount }: DesktopNavProps) => {
  return (
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
  );
};