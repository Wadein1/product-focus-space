import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusIcon, X } from "lucide-react";
import { UseFormReturn } from 'react-hook-form';
import { FundraiserFormData } from '../types';

interface VariationFieldsProps {
  form: UseFormReturn<FundraiserFormData>;
}

export const VariationFields: React.FC<VariationFieldsProps> = ({ form }) => {
  const addVariation = () => {
    const variations = form.getValues('variations');
    const basePrice = form.getValues('basePrice');
    form.setValue('variations', [...variations, { title: '', image: null, price: basePrice }]);
  };

  const removeVariation = (index: number) => {
    const variations = form.getValues('variations');
    if (variations.length > 1) {
      form.setValue('variations', variations.filter((_, i) => i !== index));
    }
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
  );
};