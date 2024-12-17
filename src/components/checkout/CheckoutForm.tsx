import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CustomerInfoFields } from "./CustomerInfoFields";
import { ShippingAddressFields } from "./ShippingAddressFields";
import { CheckoutFormData } from "@/types/checkout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => Promise<void>;
  isSubmitting: boolean;
  cartItems: any[];
}

export const CheckoutForm = ({ onSubmit, isSubmitting, cartItems }: CheckoutFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<CheckoutFormData>({
    defaultValues: {
      email: "",
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  const handleSubmit = async (data: CheckoutFormData) => {
    try {
      const { data: checkoutData, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: cartItems,
          customerEmail: data.email,
          shippingAddress: {
            name: data.name,
            address: data.address,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
          },
        },
      });

      if (error) throw error;

      if (checkoutData?.url) {
        window.location.href = checkoutData.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <CustomerInfoFields control={form.control} />
        <ShippingAddressFields control={form.control} />
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Proceed to Payment"}
        </Button>
      </form>
    </Form>
  );
};