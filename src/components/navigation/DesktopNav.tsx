
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

interface DesktopNavProps {
  isFundraisingPage?: boolean;
}

export const DesktopNav = ({ isFundraisingPage = false }: DesktopNavProps) => {
  return (
    <div className="hidden md:flex items-center space-x-8">
      <Link to="/about" className={isFundraisingPage ? "text-green-400 hover:text-green-300 transition-colors" : "nav-link"}>
        About
      </Link>
      <Link to="/fundraising" className={isFundraisingPage ? "text-green-400 hover:text-green-300 transition-colors" : "nav-link"}>
        Fundraising
      </Link>
      <Link to="/support" className={isFundraisingPage ? "text-green-400 hover:text-green-300 transition-colors" : "nav-link"}>
        Support
      </Link>
      <Link 
        to="/product" 
        className={isFundraisingPage 
          ? "bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors" 
          : "button-primary"
        }
      >
        Buy Now
      </Link>
      <Link 
        to="/cart" 
        className={isFundraisingPage 
          ? "relative p-2 hover:bg-green-800 rounded-full transition-colors text-green-400" 
          : "relative p-2 hover:bg-gray-100 rounded-full transition-colors"
        }
      >
        <ShoppingCart className="h-6 w-6" />
      </Link>
    </div>
  );
};
