
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { DonationFields } from './form/DonationFields';
import { VariationFields } from './form/VariationFields';
import { BasicInfoFields } from './form/BasicInfoFields';
import { LoadingOverlay } from "@/components/ui/loading-overlay";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);

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
        image: null,
        price: v.price
      }))
    } : {
      donationType: 'percentage',
      variations: [{ title: '', image: null, price: 0 }]
    }
  });

  const handleReAuthenticate = async () => {
    setIsAuthenticating(true);
    try {
      console.log('Re-authenticating with:', { username, password });
      
      // Check credentials directly
      if (username !== 'gonzwad' || password !== 'thanksculvers!') {
        console.log('Invalid re-auth credentials');
        throw new Error('Invalid credentials');
      }

      console.log('Re-auth successful, storing session...');
      
      // Store admin session
      sessionStorage.setItem('adminAuthenticated', 'true');
      sessionStorage.setItem('adminUsername', 'gonzwad');
      sessionStorage.setItem('adminLoginTime', new Date().toISOString());
      
      setShowAuthDialog(false);
      
      // Execute pending action if exists
      if (pendingAction) {
        await pendingAction();
        setPendingAction(null);
      }
    } catch (error: any) {
      console.error('Re-authentication error:', error);
      toast({
        title: "Authentication failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const checkCustomLinkAvailability = async (customLink: string) => {
    if (!sessionStorage.getItem('adminAuthenticated')) {
      console.log('Not authenticated, showing auth dialog');
      setShowAuthDialog(true);
      return false;
    }

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
    const submitAction = async () => {
      setIsSubmitting(true);
      try {
        console.log('Submitting fundraiser form...');
        
        if (!sessionStorage.getItem('adminAuthenticated')) {
          console.log('Not authenticated, setting pending action and showing auth dialog');
          setPendingAction(() => () => onSubmit(data));
          setShowAuthDialog(true);
          return;
        }

        console.log('Checking custom link availability...');
        const isLinkAvailable = await checkCustomLinkAvailability(data.customLink);
        
        if (!isLinkAvailable) {
          toast({
            title: "Custom link unavailable",
            description: "This custom link is already in use. Please choose another one.",
            variant: "destructive"
          });
          return;
        }

        console.log('Creating/updating fundraiser...');
        const fundraiserData = {
          title: data.title,
          description: data.description,
          custom_link: data.customLink,
          base_price: data.basePrice,
          donation_type: data.donationType,
          donation_percentage: data.donationType === 'percentage' ? data.donationPercentage : 0,
          donation_amount: data.donationType === 'fixed' ? data.donationAmount : 0
        };

        if (fundraiser) {
          // Update fundraiser
          const { error: fundraiserError } = await supabase
            .from('fundraisers')
            .update(fundraiserData)
            .eq('id', fundraiser.id);

          if (fundraiserError) throw fundraiserError;

          // Delete existing variations
          const { error: deleteError } = await supabase
            .from('fundraiser_variations')
            .delete()
            .eq('fundraiser_id', fundraiser.id);

          if (deleteError) throw deleteError;
        }

        // Create new fundraiser if needed
        const { data: savedFundraiser, error: fundraiserError } = fundraiser
          ? { data: { id: fundraiser.id }, error: null }
          : await supabase
              .from('fundraisers')
              .insert(fundraiserData)
              .select()
              .single();

        if (fundraiserError) throw fundraiserError;

        console.log('Processing variations...');
        // Handle variations
        for (const variation of data.variations) {
          if (!variation.title) continue;

          let imagePath = null;
          if (variation.image) {
            const fileExt = variation.image.name.split('.').pop();
            imagePath = `${crypto.randomUUID()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
              .from('gallery')
              .upload(imagePath, variation.image);

            if (uploadError) throw uploadError;
          }

          const { error: variationError } = await supabase
            .from('fundraiser_variations')
            .insert({
              fundraiser_id: savedFundraiser.id,
              title: variation.title,
              image_path: imagePath,
              price: variation.price,
              is_default: data.variations.indexOf(variation) === 0
            });

          if (variationError) {
            console.error('Variation error:', variationError);
            throw new Error(`Failed to create variation: ${variationError.message}`);
          }
        }

        console.log('Fundraiser saved successfully');
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
      } finally {
        setIsSubmitting(false);
      }
    };

    await submitAction();
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <BasicInfoFields form={form} />
          <DonationFields form={form} />
          <VariationFields form={form} />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {fundraiser ? 'Update' : 'Create'} Fundraiser
          </Button>
        </form>
      </Form>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
            <DialogDescription>
              Please authenticate to continue with this action.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Username (gonzwad)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password (thanksculvers!)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button 
              onClick={handleReAuthenticate} 
              className="w-full"
              disabled={isAuthenticating}
            >
              {isAuthenticating ? "Authenticating..." : "Authenticate"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <LoadingOverlay 
        show={isSubmitting} 
        message={fundraiser ? "Updating fundraiser..." : "Creating fundraiser..."} 
      />
    </>
  );
};
