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
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  customLink: z.string()
    .min(1, "Custom link is required")
    .regex(/^[a-zA-Z0-9-]+$/, "Only letters, numbers, and hyphens are allowed"),
  basePrice: z.number().min(0.01, "Base price must be greater than 0"),
  donationPercentage: z.number().min(0).max(100, "Percentage must be between 0 and 100"),
  variations: z.array(z.object({
    title: z.string().min(1, "Variation title is required"),
    image: z.any()
  }))
});

type FormData = z.infer<typeof formSchema>;

export const FundraiserForm = () => {
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variations: [{ title: '', image: null }]
    }
  });

  const checkCustomLinkAvailability = async (customLink: string) => {
    const { data, error } = await supabase
      .from('fundraisers')
      .select('id')
      .eq('custom_link', customLink)
      .maybeSingle();

    if (error) {
      console.error('Error checking custom link:', error);
      return false;
    }

    return !data; // Return true if no existing fundraiser found with this link
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Check if custom link is available
      const isLinkAvailable = await checkCustomLinkAvailability(data.customLink);
      
      if (!isLinkAvailable) {
        toast({
          title: "Custom link unavailable",
          description: "This custom link is already in use. Please choose another one.",
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
    } catch (error: any) {
      console.error('Error creating fundraiser:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create fundraiser. Please try again.",
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

          <FormField
            control={form.control}
            name="donationPercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Donation Percentage (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    max="100" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
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