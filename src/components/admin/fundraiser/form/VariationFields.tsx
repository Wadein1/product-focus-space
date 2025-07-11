import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusIcon, X, Upload, Trash2 } from "lucide-react";
import { UseFormReturn } from 'react-hook-form';
import { FundraiserFormData } from '../types';
import { supabase } from "@/integrations/supabase/client";

interface VariationFieldsProps {
  form: UseFormReturn<FundraiserFormData>;
}

export const VariationFields: React.FC<VariationFieldsProps> = ({ form }) => {
  const addVariation = () => {
    const variations = form.getValues('variations');
    const basePrice = form.getValues('basePrice');
    form.setValue('variations', [...variations, { 
      title: '', 
      images: [], 
      price: basePrice,
      existingImages: []
    }]);
  };

  const removeVariation = (index: number) => {
    const variations = form.getValues('variations');
    if (variations.length > 1) {
      form.setValue('variations', variations.filter((_, i) => i !== index));
    }
  };

  const addImages = (variationIndex: number, newFiles: File[]) => {
    const variations = form.getValues('variations');
    const currentImages = variations[variationIndex].images || [];
    variations[variationIndex].images = [...currentImages, ...newFiles];
    form.setValue('variations', variations);
  };

  const removeImage = (variationIndex: number, imageIndex: number) => {
    const variations = form.getValues('variations');
    const currentImages = variations[variationIndex].images || [];
    variations[variationIndex].images = currentImages.filter((_, i) => i !== imageIndex);
    form.setValue('variations', variations);
  };

  const removeExistingImage = async (variationIndex: number, imageIndex: number, imageId: string) => {
    const variations = form.getValues('variations');
    const existingImages = variations[variationIndex].existingImages || [];
    
    // Remove from display
    variations[variationIndex].existingImages = existingImages.filter((_, i) => i !== imageIndex);
    form.setValue('variations', variations);

    // Delete from database and storage
    try {
      const imageToDelete = existingImages[imageIndex];
      
      // Delete from storage
      if (imageToDelete.image_path) {
        await supabase.storage
          .from('gallery')
          .remove([imageToDelete.image_path]);
      }

      // Delete from database
      await supabase
        .from('fundraiser_variation_images')
        .delete()
        .eq('id', imageId);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const getImageUrl = (imagePath: string) => {
    const { data: { publicUrl } } = supabase
      .storage
      .from('gallery')
      .getPublicUrl(imagePath);
    return publicUrl;
  };

  return (
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
            name={`variations.${index}.price`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    min="0.01"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormLabel>Images</FormLabel>
            
            {/* Existing Images */}
            {variation.existingImages && variation.existingImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Existing Images:</p>
                <div className="grid grid-cols-3 gap-2">
                  {variation.existingImages.map((existingImage, imgIndex) => (
                    <div key={existingImage.id} className="relative group">
                      <img
                        src={getImageUrl(existingImage.image_path)}
                        alt={`Existing image ${imgIndex + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeExistingImage(index, imgIndex, existingImage.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            {variation.images && variation.images.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">New Images:</p>
                <div className="grid grid-cols-3 gap-2">
                  {variation.images.map((image, imgIndex) => (
                    <div key={imgIndex} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`New image ${imgIndex + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index, imgIndex)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Input */}
            <div className="border-2 border-dashed border-muted rounded-lg p-4">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 0) {
                    addImages(index, files);
                    e.target.value = ''; // Reset input
                  }
                }}
                className="hidden"
                id={`images-${index}`}
              />
              <label 
                htmlFor={`images-${index}`}
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center">
                  Click to upload images or drag and drop
                  <br />
                  <span className="text-xs">Multiple images supported</span>
                </p>
              </label>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
