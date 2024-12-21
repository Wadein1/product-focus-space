import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from 'react-hook-form';
import { FundraiserFormData } from '../types';

interface PricingFieldsProps {
  form: UseFormReturn<FundraiserFormData>;
}

export const PricingFields = ({ form }: PricingFieldsProps) => {
  return (
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
  );
};