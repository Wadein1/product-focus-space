import React from 'react';
import { useForm } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validateCustomLink } from './utils/validation';
import { VariationsSection } from './components/VariationsSection';
import { FundraiserFormData } from './types';

export const FundraiserForm = () => {
  const { toast } = useToast();
  const form = useForm<FundraiserFormData>({
    defaultValues: {
      variations: [{ title: '', image: null }]
    }
  });

  const onSubmit = async (data: FundraiserFormData) => {
    try {
      // Validate custom link
      const linkValidation = await validateCustomLink(data.customLink);
      if (typeof linkValidation === 'string') {
        toast({
          title: "Error",
          description: linkValidation,
          variant: "destructive"
        });
        return;
      }

      // Insert fundraiser
      const { data: fundraiser, error: fundraiserError } = await supabase
        .from('fundraisers')
        .insert({
          title: data.title,
          description: data.description,
          custom_link: data.customLink,
          base_price: data.basePrice,
          donation_percentage: data.donationPercentage
        })
        .select()
        .single();

      if (fundraiserError) {
        throw fundraiserError;
      }

      // Upload images and create variations
      for (const variation of data.variations) {
        if (!variation.image) continue;

        const fileExt = variation.image.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(filePath, variation.image);

        if (uploadError) throw uploadError;

        const { error: variationError } = await supabase
          .from('fundraiser_variations')
          .insert({
            fundraiser_id: fundraiser.id,
            title: variation.title,
            image_path: filePath,
            is_default: data.variations.indexOf(variation) === 0
          });

        if (variationError) throw variationError;
      }

      toast({
        title: "Fundraiser created",
        description: "Your fundraiser has been created successfully."
      });

      form.reset();
    } catch (error) {
      console.error('Error creating fundraiser:', error);
      toast({
        title: "Error",
        description: "Failed to create fundraiser. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <Input {...field} placeholder="my-fundraiser" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="basePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base Price ($)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
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
                <FormLabel>Donation Percentage (%)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" max="100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <VariationsSection form={form} />

        <Button type="submit" className="w-full">
          Create Fundraiser
        </Button>
      </form>
    </Form>
  );
};