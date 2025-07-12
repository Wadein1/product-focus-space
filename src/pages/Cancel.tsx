import { Ban } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Cancel = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full mx-auto p-8 text-center">
        <div className="animate-fade-up">
          <Ban className="w-16 h-16 mx-auto mb-6 text-red-500" />
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Order Canceled
          </h1>
          <p className="text-gray-600 mb-8">
            Your order has been canceled. No charges have been made to your account. Feel free to browse our products and try again when you're ready.
          </p>
          <Button 
            onClick={handleGoBack}
            className="bg-primary hover:bg-primary/90 text-white font-medium px-8 py-3"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Cancel;