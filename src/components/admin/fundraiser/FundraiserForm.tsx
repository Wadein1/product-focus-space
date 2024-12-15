import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Form } from "@/components/ui/form";
import { FundraiserFormFields } from './FundraiserFormFields';

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  customLink: z.string().min(1, "Custom link is required"),
  basePrice: z.string().min(1, "Base price is required"),
  donationPercentage: z.string().min(1, "Donation percentage is required"),
  image: z.any(),
});

export const FundraiserForm = () => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      customLink: "",
      basePrice: "",
      donationPercentage: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Starting form submission with values:", values);
    try {
      // Check admin authentication
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      console.log("Auth session check:", { session, authError });
      
      if (!session) {
        console.error("No auth session found");
        throw new Error("You must be logged in as an admin to create fundraisers");
      }

      // Create the fundraiser
      const { data: fundraiser, error: fundraiserError } = await supabase
        .from('fundraisers')
        .insert({
          title: values.title,
          description: values.description || null,
          custom_link: values.customLink,
          base_price: parseFloat(values.basePrice),
          donation_percentage: parseInt(values.donationPercentage),
          status: 'active'
        })
        .select()
        .single();

      console.log("Fundraiser creation response:", { fundraiser, fundraiserError });

      if (fundraiserError) {
        console.error("Error creating fundraiser:", fundraiserError);
        throw fundraiserError;
      }

      // Handle image upload if provided
      if (values.image && values.image[0]) {
        console.log("Starting image upload");
        const file = values.image[0];
        const fileExt = file.name.split('.').pop();
        const filePath = `${fundraiser.id}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(filePath, file);

        console.log("Image upload response:", { filePath, uploadError });

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          throw uploadError;
        }

        // Create variation with uploaded image
        const { error: variationError } = await supabase
          .from('fundraiser_variations')
          .insert({
            fundraiser_id: fundraiser.id,
            title: 'Default Variation',
            image_path: filePath,
            is_default: true
          });

        console.log("Variation creation response:", { variationError });

        if (variationError) {
          console.error("Error creating variation:", variationError);
          throw variationError;
        }
      }

      toast({
        title: "Success",
        description: "Fundraiser created successfully!",
      });

      // Reset form
      form.reset();
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create fundraiser. Please try again.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FundraiserFormFields form={form} />
        <Button type="submit">Create Fundraiser</Button>
      </form>
    </Form>
  );
};