import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FundraiserFormData } from '../types';

interface SchoolModeFieldsProps {
  form: UseFormReturn<FundraiserFormData>;
}

export const SchoolModeFields: React.FC<SchoolModeFieldsProps> = ({ form }) => {
  const schoolMode = form.watch('schoolMode');
  const bigSchool = form.watch('bigSchool');

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">School Mode</h3>
          <p className="text-sm text-muted-foreground">Enable school-specific language and features</p>
        </div>
        <FormField
          control={form.control}
          name="schoolMode"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Switch
                  checked={field.value || false}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (!checked) {
                      form.setValue('bigSchool', false);
                      form.setValue('teacherList', '');
                    }
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {schoolMode && (
        <>
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <h4 className="text-base font-medium">Big School</h4>
              <p className="text-sm text-muted-foreground">Enable searchable teacher dropdown for large schools</p>
            </div>
            <FormField
              control={form.control}
              name="bigSchool"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {bigSchool && (
            <FormField
              control={form.control}
              name="teacherList"
              render={({ field }) => (
                <FormItem className="pt-4 border-t">
                  <FormLabel>Teacher Names (comma-separated)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mr. Johnson, Mrs. Smith, Ms. Davis, Mr. Brown..."
                      className="min-h-[120px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Enter teacher names separated by commas. They will be parsed and used in the searchable dropdown.
                  </p>
                </FormItem>
              )}
            />
          )}
        </>
      )}
    </div>
  );
};