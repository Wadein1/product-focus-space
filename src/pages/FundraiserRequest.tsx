import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const requestSchema = z.object({
  organizationName: z.string().min(1, 'Organization name is required'),
  contactName: z.string().min(1, 'Contact name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  fundraiserGoal: z.string().min(1, 'Fundraiser goal is required'),
  website: z.string().optional(),
  timeline: z.string().min(1, 'Timeline is required'),
});

type RequestFormData = z.infer<typeof requestSchema>;

const FundraiserRequest = () => {
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema)
  });

  const onSubmit = async (data: RequestFormData) => {
    try {
      // Store the request in the database
      const { error } = await supabase
        .from('fundraising_requests')
        .insert({
          company_name: data.organizationName,
          contact_email: data.email,
          description: `Contact: ${data.contactName}\nPhone: ${data.phone}\nGoal: ${data.fundraiserGoal}\nTimeline: ${data.timeline}\nWebsite: ${data.website || 'Not provided'}`,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Request Submitted Successfully!",
        description: "We'll review your request and get back to you within 2-3 business days.",
      });

      reset();
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Start Your Fundraiser
              </CardTitle>
              <p className="text-center text-muted-foreground">
                Tell us about your organization and fundraising goals
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organizationName">Organization Name *</Label>
                    <Input
                      id="organizationName"
                      {...register('organizationName')}
                      placeholder="Your team/organization name"
                    />
                    {errors.organizationName && (
                      <p className="text-sm text-destructive">{errors.organizationName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input
                      id="contactName"
                      {...register('contactName')}
                      placeholder="Your full name"
                    />
                    {errors.contactName && (
                      <p className="text-sm text-destructive">{errors.contactName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      placeholder="(555) 123-4567"
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fundraiserGoal">Fundraising Goal *</Label>
                  <Input
                    id="fundraiserGoal"
                    {...register('fundraiserGoal')}
                    placeholder="e.g., Raise $5,000 for new equipment"
                  />
                  {errors.fundraiserGoal && (
                    <p className="text-sm text-destructive">{errors.fundraiserGoal.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeline">Desired Timeline *</Label>
                  <Input
                    id="timeline"
                    {...register('timeline')}
                    placeholder="e.g., Need to complete by December 2024"
                  />
                  {errors.timeline && (
                    <p className="text-sm text-destructive">{errors.timeline.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Team/Company Website (optional)</Label>
                  <Input
                    id="website"
                    {...register('website')}
                    placeholder="https://yourorganization.com"
                  />
                  {errors.website && (
                    <p className="text-sm text-destructive">{errors.website.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FundraiserRequest;