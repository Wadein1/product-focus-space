
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const EmptyCart = () => {
  const navigate = useNavigate();
  
  const handleContinueShopping = () => {
    // Check if there's a stored previous page
    const previousPage = sessionStorage.getItem('previousPage');
    
    if (previousPage && previousPage !== '/cart') {
      navigate(previousPage);
    } else {
      // Default to product page if no previous page is stored
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
