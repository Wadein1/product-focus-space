import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { FundraiserFormData } from '../types';

interface SchoolModeFieldsProps {
  form: UseFormReturn<FundraiserFormData>;
}

export const SchoolModeFields: React.FC<SchoolModeFieldsProps> = ({ form }) => {
  const { control, watch } = form;
  const schoolMode = watch('schoolMode');

  return (
    <Card>
      <CardHeader>
        <CardTitle>School Mode Settings</CardTitle>
        <CardDescription>
          Enable school mode to customize wording for school fundraisers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="schoolMode"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  School Mode
                </FormLabel>
                <div className="text-sm text-muted-foreground">
                  Changes "Pickup from my team" to "Deliver to my school", "Age Division" to "Grade", and "Team" to "Teacher"
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {schoolMode && (
          <FormField
            control={control}
            name="bigSchool"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Big School
                  </FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Changes "Teacher" to "Homeroom Teacher" with searchable functionality
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  );
};
