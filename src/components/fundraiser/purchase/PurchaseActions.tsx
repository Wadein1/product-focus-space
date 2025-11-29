
import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/types/cart";

interface PurchaseActionsProps {
  price: number;
  quantity: number;
  productName: string;
  imagePath?: string;
  fundraiserId: string;
  variationId: string;
  deliveryMethod: 'shipping' | 'pickup';
  ageDivision: string;
  teamName: string;
  fundraiserTitle?: string;
  variationTitle?: string;
  isPickupAvailable?: boolean;
  schoolMode?: boolean;
  bigSchool?: boolean;
  schoolButtonClicked?: boolean;
  onSchoolButtonClick?: () => void;
}

export const PurchaseActions = ({
  price,
  quantity,
  productName,
  imagePath,
  fundraiserId,
  variationId,
  deliveryMethod,
  ageDivision,
  teamName,
  fundraiserTitle,
  variationTitle,
  isPickupAvailable = true,
  schoolMode = false,
  bigSchool = false,
  schoolButtonClicked = false,
  onSchoolButtonClick
}: PurchaseActionsProps) => {
  const { toast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = React.useState(false);

  const validateTeamSelection = () => {
    if (deliveryMethod === 'pickup') {
      if (!isPickupAvailable) {
        const deliveryType = schoolMode ? "School delivery" : "Team pickup";
        toast({
          title: `${deliveryType} not available`,
          description: `${deliveryType} is not configured for this fundraiser.`,
          variant: "destructive",
        });
        return false;
      }
      if (!ageDivision || !teamName) {
        const divisionLabel = schoolMode ? "grade" : "age division";
        const teamLabel = bigSchool ? "homeroom teacher" : schoolMode ? "teacher" : "team";
        toast({
          title: "Selection required",
          description: `Please select both ${divisionLabel} and ${teamLabel} for ${schoolMode ? "school delivery" : "pickup"} orders.`,
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  // Calculate donation amount based on fundraiser settings
  const calculateDonationAmount = async (itemPrice: number, qty: number) => {
    try {
      // Fetch the fundraiser details to get donation settings
      const { data: fundraiser, error } = await supabase
        .from('fundraisers')
        .select('donation_type, donation_percentage, donation_amount')
        .eq('id', fundraiserId)
        .single();

      if (error || !fundraiser) {
        console.error('Error fetching fundraiser:', error);
        return 0;
      }

      let donationAmount = 0;
      
      if (fundraiser.donation_type === 'percentage') {
        // For percentage: calculate based on item price (excluding shipping) * percentage
        const itemPriceOnly = itemPrice; // Item price already excludes shipping
        donationAmount = (itemPriceOnly * (fundraiser.donation_percentage / 100)) * qty;
      } else {
        // For fixed amount: multiply fixed donation amount by quantity
        donationAmount = (fundraiser.donation_amount || 0) * qty;
      }

      return donationAmount;
    } catch (error) {
      console.error('Error calculating donation amount:', error);
      return 0;
    }
  };

  const handleAddToCart = () => {
    if (!validateTeamSelection()) return;

    try {
      setIsAddingToCart(true);

      const cartItem: CartItem = {
        id: crypto.randomUUID(),
        product_name: productName,
        price: price,
        quantity: quantity,
        image_path: imagePath,
        is_fundraiser: true,
        delivery_method: deliveryMethod,
        ...(deliveryMethod === 'pickup' && {
          team_name: `${ageDivision} - ${teamName}`
        })
      };

      const existingCartJson = localStorage.getItem('cartItems');
      const existingCart = existingCartJson ? JSON.parse(existingCartJson) : [];
      const updatedCart = [...existingCart, cartItem];
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));

      toast({
        title: "Added to cart",
        description: "The item has been added to your cart",
      });
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!validateTeamSelection()) return;

    try {
      const shippingCost = deliveryMethod === 'shipping' ? 5.00 : 0;
      const donationAmount = await calculateDonationAmount(price, quantity);
      
      console.log('Creating fundraiser checkout with:', {
        quantity,
        shippingCost,
        fundraiserId,
        variationId,
        deliveryMethod,
        ageDivision,
        teamName,
        fundraiserTitle,
        variationTitle,
        donationAmount
      });

      const { data: checkoutData, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: [{
            product_name: productName,
            price: price,
            quantity: quantity,
            image_path: imagePath,
            is_fundraiser: true,
            delivery_method: deliveryMethod,
            ...(deliveryMethod === 'pickup' && {
              team_name: `${ageDivision} - ${teamName}`
            })
          }],
          metadata: {
            fundraiser_id: fundraiserId,
            variation_id: variationId,
            is_fundraiser: 'true',
            delivery_method: deliveryMethod,
            fundraiser_name: fundraiserTitle || 'Unknown Fundraiser',
            item_name: variationTitle || productName,
            school_mode: schoolMode.toString(),
            big_school: bigSchool.toString(),
            school_button_clicked: schoolButtonClicked.toString(),
            ...(deliveryMethod === 'pickup' && {
              team_age_division: ageDivision,
              team_name: teamName,
              pickup_team_name: teamName,
              grade: schoolMode ? ageDivision : '',
              teacher: schoolMode && !bigSchool ? teamName : '',
              homeroom_teacher: bigSchool ? teamName : ''
            })
          },
          shipping_cost: shippingCost,
          // Add fundraiser tracking data to success URL
          success_url_params: {
            fundraiser_id: fundraiserId,
            variation_id: variationId,
            quantity: quantity.toString(),
            item_price: price.toString(),
            donation_amount: donationAmount.toString()
          },
          return_url: window.location.pathname
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!checkoutData?.url) {
        console.error('No checkout URL received:', checkoutData);
        throw new Error('No checkout URL received from Stripe');
      }

      window.location.href = checkoutData.url;
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isDisabled = deliveryMethod === 'pickup' && (!isPickupAvailable || !ageDivision || !teamName);

  const divisionLabel = schoolMode ? "grade" : "age division";
  const teamLabel = bigSchool ? "homeroom teacher" : schoolMode ? "teacher" : "team";
  const deliveryType = schoolMode ? "school delivery" : "pickup";

  return (
    <div className="space-y-3">
      <Button 
        onClick={handleBuyNow}
        className="w-full bg-[#0CA2ED] hover:bg-[#0CA2ED]/90 text-white font-medium py-6"
        size="lg"
        disabled={isDisabled}
      >
        Buy Now
      </Button>
      <Button 
        onClick={handleAddToCart}
        variant="outline"
        className="w-full border-[#0CA2ED] text-[#0CA2ED] hover:bg-[#0CA2ED]/10"
        size="lg"
        disabled={isAddingToCart || isDisabled}
      >
        {isAddingToCart ? 'Adding to Cart...' : 'Add to Cart'}
      </Button>
      {schoolMode && onSchoolButtonClick && (
        <Button 
          onClick={onSchoolButtonClick}
          variant={schoolButtonClicked ? "default" : "outline"}
          className={`w-full ${schoolButtonClicked ? 'bg-[#0CA2ED] text-white' : 'border-[#0CA2ED] text-[#0CA2ED]'} hover:bg-[#0CA2ED]/90 hover:text-white`}
          size="lg"
        >
          {schoolButtonClicked ? '✓ School Option Selected' : 'Select School Option'}
        </Button>
      )}
      {isDisabled && deliveryMethod === 'pickup' && (
        <p className="text-sm text-gray-500 text-center">
          {!isPickupAvailable 
            ? `${deliveryType.charAt(0).toUpperCase() + deliveryType.slice(1)} is not available for this fundraiser` 
            : `Please select ${divisionLabel} and ${teamLabel} to continue`
          }
        </p>
      )}
    </div>
  );
};
