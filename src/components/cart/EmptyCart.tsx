
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const EmptyCart = () => {
  const navigate = useNavigate();
  
  const handleContinueShopping = () => {
    // Get the previous page from browser history or default to product page
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/product');
    }
  };
  
  return (
    <div className="text-center py-12">
      <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
      <Button 
        onClick={handleContinueShopping}
        variant="outline"
      >
        Continue Shopping
      </Button>
    </div>
  );
};
