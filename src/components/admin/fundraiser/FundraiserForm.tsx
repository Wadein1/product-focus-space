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
import { TeamPickupFields } from './form/TeamPickupFields';
import { SchoolModeFields } from './form/SchoolModeFields';

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
      schoolMode: fundraiser.school_mode || false,
      bigSchool: fundraiser.big_school || false,
      variations: fundraiser.fundraiser_variations.map(v => ({
        title: v.title,
        images: [],
        price: v.price,
        existingImages: v.fundraiser_variation_images || []
      })),
      ageDivisions: fundraiser.fundraiser_age_divisions?.map(d => ({
        divisionName: d.division_name,
        teams: d.fundraiser_teams.map(t => ({
          teamName: t.team_name
        }))
      })) || []
    } : {
      donationType: 'percentage',
      schoolMode: false,
      bigSchool: false,
      variations: [{ title: '', images: [], price: 0, existingImages: [] }],
      ageDivisions: []
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
          donation_amount: data.donationType === 'fixed' ? data.donationAmount : 0,
          school_mode: data.schoolMode || false,
          big_school: data.bigSchool || false
        };

        if (fundraiser) {
          // Update fundraiser
          const { error: fundraiserError } = await supabase
            .from('fundraisers')
            .update(fundraiserData)
            .eq('id', fundraiser.id);

          if (fundraiserError) throw fundraiserError;

          // Delete existing variations and age divisions
          const { error: deleteVariationsError } = await supabase
            .from('fundraiser_variations')
            .delete()
            .eq('fundraiser_id', fundraiser.id);

          if (deleteVariationsError) throw deleteVariationsError;

          const { error: deleteDivisionsError } = await supabase
            .from('fundraiser_age_divisions')
            .delete()
            .eq('fundraiser_id', fundraiser.id);

          if (deleteDivisionsError) throw deleteDivisionsError;
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

          // Create variation first
          const { data: savedVariation, error: variationError } = await supabase
            .from('fundraiser_variations')
            .insert({
              fundraiser_id: savedFundraiser.id,
              title: variation.title,
              image_path: null, // Will be updated with first image if any
              price: variation.price,
              is_default: data.variations.indexOf(variation) === 0
            })
            .select()
            .single();

          if (variationError) {
            console.error('Variation error:', variationError);
            throw new Error(`Failed to create variation: ${variationError.message}`);
          }

          // Handle both existing and new images for this variation
          let imageDisplayOrder = 0;
          let firstImagePath = null;

          // First, handle existing images (preserve their order)
          if (variation.existingImages && variation.existingImages.length > 0) {
            for (const existingImage of variation.existingImages) {
              const { error: imageError } = await supabase
                .from('fundraiser_variation_images')
                .insert({
                  variation_id: savedVariation.id,
                  image_path: existingImage.image_path,
                  display_order: existingImage.display_order !== undefined ? existingImage.display_order : imageDisplayOrder
                });

              if (imageError) throw imageError;

              // Set first image for backward compatibility
              if (!firstImagePath) {
                firstImagePath = existingImage.image_path;
              }
              
              imageDisplayOrder++;
            }
          }

          // Then, handle new uploaded images
          if (variation.images && variation.images.length > 0) {
            for (const image of variation.images) {
              const fileExt = image.name.split('.').pop();
              const imagePath = `${crypto.randomUUID()}.${fileExt}`;

              const { error: uploadError } = await supabase.storage
                .from('gallery')
                .upload(imagePath, image);

              if (uploadError) throw uploadError;

              // Insert into variation images table
              const { error: imageError } = await supabase
                .from('fundraiser_variation_images')
                .insert({
                  variation_id: savedVariation.id,
                  image_path: imagePath,
                  display_order: imageDisplayOrder
                });

              if (imageError) throw imageError;

              // Set first image for backward compatibility if no existing images
              if (!firstImagePath) {
                firstImagePath = imagePath;
              }
              
              imageDisplayOrder++;
            }
          }

          // Update variation with first image path for backward compatibility
          if (firstImagePath) {
            await supabase
              .from('fundraiser_variations')
              .update({ image_path: firstImagePath })
              .eq('id', savedVariation.id);
          }
        }

        console.log('Processing age divisions and teams...');
        // Handle age divisions and teams
        if (data.ageDivisions && data.ageDivisions.length > 0) {
          for (let i = 0; i < data.ageDivisions.length; i++) {
            const division = data.ageDivisions[i];
            if (!division.divisionName) continue;

            // Create age division
            const { data: savedDivision, error: divisionError } = await supabase
              .from('fundraiser_age_divisions')
              .insert({
                fundraiser_id: savedFundraiser.id,
                division_name: division.divisionName,
                display_order: i
              })
              .select()
              .single();

            if (divisionError) {
              console.error('Division error:', divisionError);
              throw new Error(`Failed to create age division: ${divisionError.message}`);
            }

            // Create teams for this division
            if (division.teams && division.teams.length > 0) {
              for (let j = 0; j < division.teams.length; j++) {
                const team = division.teams[j];
                if (!team.teamName) continue;

                const { error: teamError } = await supabase
                  .from('fundraiser_teams')
                  .insert({
                    age_division_id: savedDivision.id,
                    team_name: team.teamName,
                    display_order: j
                  });

                if (teamError) {
                  console.error('Team error:', teamError);
                  throw new Error(`Failed to create team: ${teamError.message}`);
                }
              }
            }
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
          <SchoolModeFields form={form} />
          <VariationFields form={form} />
          <TeamPickupFields form={form} />
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
