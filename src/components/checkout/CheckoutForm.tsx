import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CustomerInfoFields } from "./CustomerInfoFields";
import { ShippingAddressFields } from "./ShippingAddressFields";
import { CheckoutFormData } from "@/types/checkout";

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => Promise<void>;
  isSubmitting: boolean;
}

export const CheckoutForm = ({ onSubmit, isSubmitting }: CheckoutFormProps) => {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CustomerInfoFields control={form.control} />
        <ShippingAddressFields control={form.control} />
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Place Order"}
        </Button>
      </form>
    </Form>
  );
};