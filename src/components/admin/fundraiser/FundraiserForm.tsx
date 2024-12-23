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
import { zodResolver } from "@hookform/resolvers/zod";
import { DonationFields } from './form/DonationFields';
import { VariationFields } from './form/VariationFields';
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
        image: null
      }))
    } : {
      donationType: 'percentage',
      variations: [{ title: '', image: null }]
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
        donation_percentage: data.donationType === 'percentage' ? data.donationPercentage : null,
        donation_amount: data.donationType === 'fixed' ? data.donationAmount : null
      };

      // Update or create fundraiser
      const { data: savedFundraiser, error: fundraiserError } = fundraiser
        ? await supabase
            .from('fundraisers')
            .update(fundraiserData)
            .eq('id', fundraiser.id)
            .select()
            .single()
        : await supabase
            .from('fundraisers')
            .insert(fundraiserData)
            .select()
            .single();

      if (fundraiserError) throw fundraiserError;

      // Handle variations
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
            fundraiser_id: savedFundraiser.id,
            title: variation.title,
            image_path: filePath,
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

        <FormField
          control={form.control}
          name="basePrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base Price ($)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DonationFields form={form} />
        <VariationFields form={form} />

        <Button type="submit" className="w-full">
          {fundraiser ? 'Update' : 'Create'} Fundraiser
        </Button>
      </form>
    </Form>
  );
};