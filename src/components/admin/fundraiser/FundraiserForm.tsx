import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validateCustomLink } from './utils/validation';
import { VariationsSection } from './components/VariationsSection';
import { BasicInfoFields } from './components/BasicInfoFields';
import { PricingFields } from './components/PricingFields';
import { uploadFile } from './utils/fileUpload';
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

      if (fundraiserError) throw fundraiserError;

      // Process variations
      for (const variation of data.variations) {
        if (!variation.image) continue;

        try {
          const filePath = await uploadFile(variation.image, 'gallery');

          const { error: variationError } = await supabase
            .from('fundraiser_variations')
            .insert({
              fundraiser_id: fundraiser.id,
              title: variation.title,
              image_path: filePath,
              is_default: data.variations.indexOf(variation) === 0
            });

          if (variationError) {
            console.error('Variation error:', variationError);
            throw variationError;
          }
        } catch (error) {
          console.error('Error processing variation:', error);
          toast({
            title: "Error",
            description: `Failed to process variation "${variation.title}". Please try again.`,
            variant: "destructive"
          });
          continue;
        }
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
        <BasicInfoFields form={form} />
        <PricingFields form={form} />
        <VariationsSection form={form} />
        <Button type="submit" className="w-full">
          Create Fundraiser
        </Button>
      </form>
    </Form>
  );
};