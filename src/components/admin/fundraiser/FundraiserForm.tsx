import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

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
        description: "Failed to create fundraiser. Please try again.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Link</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="basePrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base Price ($)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="donationPercentage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Donation Percentage</FormLabel>
              <FormControl>
                <Input type="number" min="0" max="100" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Default Image</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onChange(e.target.files)}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Create Fundraiser</Button>
      </form>
    </Form>
  );
};