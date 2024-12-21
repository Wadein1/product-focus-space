import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Success = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full mx-auto p-8 text-center">
        <div className="animate-fade-up">
          <CheckCircle className="w-16 h-16 mx-auto mb-6 text-green-500" />
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Thank you for your order!
          </h1>
          <p className="text-gray-600 mb-8">
            Your order has been received and is being processed. We'll send you an email with tracking information once your order ships.
          </p>
          <Link to="/">
            <Button className="bg-primary hover:bg-primary/90 text-white font-medium px-8 py-3">
              Return to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Success;