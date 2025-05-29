import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const EmptyCart = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-12">
      <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
      <Button 
        onClick={() => navigate('/product')}
        variant="outline"
      >
        Continue Shopping
      </Button>
    </div>
  );
};