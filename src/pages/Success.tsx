
import { CheckCircle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Success = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isTracking, setIsTracking] = useState(false);
  const [trackingComplete, setTrackingComplete] = useState(false);

  useEffect(() => {
    const trackFundraiserSale = async () => {
      // Get fundraiser data from URL parameters (passed from checkout)
      const fundraiserId = searchParams.get('fundraiser_id');
      const variationId = searchParams.get('variation_id');
      const quantity = searchParams.get('quantity');
      const itemPrice = searchParams.get('item_price');
      const donationAmount = searchParams.get('donation_amount');
      const stripeSessionId = searchParams.get('session_id');

      console.log('Success page params:', {
        fundraiserId,
        variationId,
        quantity,
        itemPrice,
        donationAmount,
        stripeSessionId
      });

      // Only track if this is a fundraiser purchase
      if (fundraiserId && variationId && quantity && itemPrice && donationAmount) {
        setIsTracking(true);
        
        try {
          console.log('Tracking fundraiser sale...');
          
          const { data, error } = await supabase.functions.invoke('track-fundraiser-sale', {
            body: {
              fundraiser_id: fundraiserId,
              variation_id: variationId,
              quantity: parseInt(quantity),
              item_price: parseFloat(itemPrice),
              donation_amount: parseFloat(donationAmount),
              stripe_session_id: stripeSessionId,
              customer_email: 'tracked_via_success_page' // Placeholder
            }
          });

          if (error) {
            console.error('Error tracking fundraiser sale:', error);
            toast({
              title: "Tracking Notice",
              description: "Your order was successful, but we couldn't immediately track the fundraiser earnings. This will be resolved automatically.",
              variant: "default",
            });
          } else {
            console.log('Fundraiser sale tracked successfully:', data);
            setTrackingComplete(true);
            toast({
              title: "Fundraiser Updated!",
              description: "The fundraiser totals have been updated with your purchase.",
              variant: "default",
            });
          }
        } catch (error) {
          console.error('Error in tracking request:', error);
          toast({
            title: "Tracking Notice", 
            description: "Your order was successful, but we couldn't immediately track the fundraiser earnings. This will be resolved automatically.",
            variant: "default",
          });
        } finally {
          setIsTracking(false);
        }
      }
    };

    trackFundraiserSale();
  }, [searchParams, toast]);

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
          
          {isTracking && (
            <p className="text-sm text-blue-600 mb-4">
              Updating fundraiser totals...
            </p>
          )}

          {trackingComplete && (
            <p className="text-sm text-green-600 mb-4">
              ✓ Fundraiser totals updated successfully!
            </p>
          )}
          
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
