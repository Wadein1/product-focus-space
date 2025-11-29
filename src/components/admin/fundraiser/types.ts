
import { z } from 'zod';

export interface Fundraiser {
  id: string;
  title: string;
  description?: string;
  custom_link: string;
  donation_type: 'percentage' | 'fixed';
  donation_percentage: number;
  donation_amount?: number;
  base_price: number;
  status: string;
  created_at: string;
  fundraiser_variations?: FundraiserVariation[];
  fundraiser_age_divisions?: FundraiserAgeDivision[];
  // Shipping control options
  allow_team_shipping?: boolean;
  allow_regular_shipping?: boolean;
  // School mode options
  school_mode?: boolean;
  big_school?: boolean;
  teacher_list?: string[];
  // New properties for admin display
  total_raised?: number;
  profit?: number;
}

export interface FundraiserVariation {
  id: string;
  title: string;
  image_path?: string;
  is_default: boolean;
  price: number;
  fundraiser_variation_images?: FundraiserVariationImage[];
}

export interface FundraiserVariationImage {
  id: string;
  variation_id: string;
  image_path: string;
  display_order: number;
}

export interface FundraiserAgeDivision {
  id: string;
  division_name: string;
  display_order: number;
  fundraiser_teams?: FundraiserTeam[];
}

export interface FundraiserTeam {
  id: string;
  team_name: string;
  display_order: number;
}

// Form-related types and schema
export const fundraiserFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  customLink: z.string().min(1, "Custom link is required"),
  basePrice: z.number().min(0.01, "Base price must be greater than 0"),
  donationType: z.enum(['percentage', 'fixed']),
  donationPercentage: z.number().min(0).max(100).optional(),
  donationAmount: z.number().min(0).optional(),
  schoolMode: z.boolean().optional(),
  bigSchool: z.boolean().optional(),
  teacherList: z.string().optional(),
  variations: z.array(z.object({
    title: z.string().min(1, "Variation title is required"),
    images: z.array(z.instanceof(File)).optional(),
    price: z.number().min(0.01, "Price must be greater than 0"),
    existingImages: z.array(z.object({
      id: z.string(),
      image_path: z.string(),
      display_order: z.number()
    })).optional()
  })).min(1, "At least one variation is required"),
  ageDivisions: z.array(z.object({
    divisionName: z.string().min(1, "Division name is required"),
    teams: z.array(z.object({
      teamName: z.string().min(1, "Team name is required")
    }))
  })).optional()
});

export type FundraiserFormData = z.infer<typeof fundraiserFormSchema>;
