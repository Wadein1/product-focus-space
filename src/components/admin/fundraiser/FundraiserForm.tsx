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
import { PlusIcon, X } from "lucide-react";

interface FundraiserFormData {
  title: string;
  description: string;
  customLink: string;
  basePrice: number;
  donationPercentage: number;
  variations: {
    title: string;
    image: File | null;
  }[];
}

export const FundraiserForm = () => {
  const { toast } = useToast();
  const form = useForm<FundraiserFormData>({
    defaultValues: {
      variations: [{ title: '', image: null }]
    }
  });

  const validateCustomLink = async (customLink: string) => {
    const { data, error } = await supabase
      .from('fundraisers')
      .select('custom_link')
      .eq('custom_link', customLink)
      .single();

    if (data) {
      return "This custom link is already taken. Please choose another one.";
    }
    return true;
  };

  const onSubmit = async (data: FundraiserFormData) => {
    try {
      // Validate custom link first
      const linkValidation = await validateCustomLink(data.customLink);
      if (linkValidation !== true) {
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
        if (fundraiserError.code === '23505') {
          toast({
            title: "Error",
            description: "This custom link is already taken. Please choose another one.",
            variant: "destructive"
          });
          return;
        }
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

  const addVariation = () => {
    const variations = form.getValues('variations');
    form.setValue('variations', [...variations, { title: '', image: null }]);
  };

  const removeVariation = (index: number) => {
    const variations = form.getValues('variations');
    if (variations.length > 1) {
      form.setValue('variations', variations.filter((_, i) => i !== index));
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

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Variations</h3>
            <Button type="button" onClick={addVariation} variant="outline" size="sm">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Variation
            </Button>
          </div>

          {form.watch('variations').map((variation, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Variation {index + 1}</h4>
                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariation(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <FormField
                control={form.control}
                name={`variations.${index}.title`}
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
                name={`variations.${index}.image`}
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChange(file);
                          }
                        }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>

        <Button type="submit" className="w-full">
          Create Fundraiser
        </Button>
      </form>
    </Form>
  );
};