import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from 'react-hook-form';
import { FundraiserFormData } from '../types';

interface BasicInfoFieldsProps {
  form: UseFormReturn<FundraiserFormData>;
}

export const BasicInfoFields = ({ form }: BasicInfoFieldsProps) => {
  return (
    <>
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
    </>
  );
};