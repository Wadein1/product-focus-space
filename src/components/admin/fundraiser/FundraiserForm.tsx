import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { DonationFields } from './form/DonationFields';
import { VariationFields } from './form/VariationFields';
import { BasicInfoFields } from './form/BasicInfoFields';
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { fundraiserFormSchema, type FundraiserFormData, type Fundraiser } from './types';

interface FundraiserFormProps {
  fundraiser?: Fundraiser;
  onSuccess?: () => void;
}

export const FundraiserForm: React.FC<FundraiserFormProps> = ({ 
  fundraiser,
  onSuccess 
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<FundraiserFormData>({
    resolver: zodResolver(fundraiserFormSchema),
    defaultValues: fundraiser ? {
      title: fundraiser.title,
      description: fundraiser.description || '',
      customLink: fundraiser.custom_link,
      basePrice: fundraiser.base_price,
      donationType: fundraiser.donation_type,
      donationPercentage: fundraiser.donation_percentage || undefined,
      donationAmount: fundraiser.donation_amount || undefined,
      variations: fundraiser.fundraiser_variations.map(v => ({
        title: v.title,
        image: null,
        price: v.price
      }))
    } : {
      donationType: 'percentage',
      variations: [{ title: '', image: null, price: 0 }]
    }
  });

  const checkCustomLinkAvailability = async (customLink: string) => {
    const query = supabase
      .from('fundraisers')
      .select('id')
      .eq('custom_link', customLink);
    
    if (fundraiser) {
      query.neq('id', fundraiser.id);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('Error checking custom link:', error);
      return false;
    }

    return !data;
  };

  const onSubmit = async (data: FundraiserFormData) => {
    setIsSubmitting(true);
    try {
      const isLinkAvailable = await checkCustomLinkAvailability(data.customLink);
      
      if (!isLinkAvailable) {
        toast({
          title: "Custom link unavailable",
          description: "This custom link is already in use. Please choose another one.",
          variant: "destructive"
        });
        return;
      }

      const fundraiserData = {
        title: data.title,
        description: data.description,
        custom_link: data.customLink,
        base_price: data.basePrice,
        donation_type: data.donationType,
        donation_percentage: data.donationType === 'percentage' ? data.donationPercentage : 0,
        donation_amount: data.donationType === 'fixed' ? data.donationAmount : 0
      };

      if (fundraiser) {
        // Update fundraiser
        const { error: fundraiserError } = await supabase
          .from('fundraisers')
          .update(fundraiserData)
          .eq('id', fundraiser.id);

        if (fundraiserError) throw fundraiserError;

        // Delete existing variations
        const { error: deleteError } = await supabase
          .from('fundraiser_variations')
          .delete()
          .eq('fundraiser_id', fundraiser.id);

        if (deleteError) throw deleteError;
      }

      // Create new fundraiser if needed
      const { data: savedFundraiser, error: fundraiserError } = fundraiser
        ? { data: { id: fundraiser.id }, error: null }
        : await supabase
            .from('fundraisers')
            .insert(fundraiserData)
            .select()
            .single();

      if (fundraiserError) throw fundraiserError;

      // Handle variations
      for (const variation of data.variations) {
        if (!variation.title) continue;

        let imagePath = null;
        if (variation.image) {
          const fileExt = variation.image.name.split('.').pop();
          imagePath = `${crypto.randomUUID()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('gallery')
            .upload(imagePath, variation.image);

          if (uploadError) throw uploadError;
        }

        const { error: variationError } = await supabase
          .from('fundraiser_variations')
          .insert({
            fundraiser_id: savedFundraiser.id,
            title: variation.title,
            image_path: imagePath,
            price: variation.price,
            is_default: data.variations.indexOf(variation) === 0
          });

        if (variationError) throw variationError;
      }

      toast({
        title: fundraiser ? "Fundraiser updated" : "Fundraiser created",
        description: fundraiser 
          ? "Your fundraiser has been updated successfully."
          : "Your fundraiser has been created successfully."
      });

      if (onSuccess) {
        onSuccess();
      }

      if (!fundraiser) {
        form.reset();
      }
    } catch (error: any) {
      console.error('Error saving fundraiser:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save fundraiser. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <BasicInfoFields form={form} />
          <DonationFields form={form} />
          <VariationFields form={form} />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {fundraiser ? 'Update' : 'Create'} Fundraiser
          </Button>
        </form>
      </Form>
      <LoadingOverlay 
        show={isSubmitting} 
        message={fundraiser ? "Updating fundraiser..." : "Creating fundraiser..."} 
      />
    </>
  );
};