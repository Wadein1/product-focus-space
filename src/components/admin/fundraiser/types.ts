
import { z } from "zod";

export const fundraiserFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  customLink: z.string()
    .min(1, "Custom link is required")
    .regex(/^[a-zA-Z0-9-]+$/, "Only letters, numbers, and hyphens are allowed"),
  basePrice: z.number().min(0.01, "Base price must be greater than 0"),
  donationType: z.enum(['percentage', 'fixed']),
  donationPercentage: z.number().min(0).max(100, "Percentage must be between 0 and 100").optional(),
  donationAmount: z.number().min(0, "Amount must be greater than or equal to 0").optional(),
  variations: z.array(z.object({
    title: z.string().min(1, "Variation title is required"),
    image: z.any(),
    price: z.number().min(0.01, "Price must be greater than 0")
  })),
  ageDivisions: z.array(z.object({
    divisionName: z.string().min(1, "Division name is required"),
    teams: z.array(z.object({
      teamName: z.string().min(1, "Team name is required")
    }))
  })).optional()
});

export type FundraiserFormData = z.infer<typeof fundraiserFormSchema>;

export interface FundraiserVariation {
  id: string;
  title: string;
  image_path: string;
  is_default: boolean;
  price: number;
}

export interface FundraiserTeam {
  id: string;
  team_name: string;
  display_order: number;
}

export interface FundraiserAgeDivision {
  id: string;
  division_name: string;
  display_order: number;
  fundraiser_teams: FundraiserTeam[];
}

export interface Fundraiser {
  id: string;
  title: string;
  description: string | null;
  custom_link: string;
  base_price: number;
  donation_type: 'percentage' | 'fixed';
  donation_percentage: number | null;
  donation_amount: number | null;
  fundraiser_variations: FundraiserVariation[];
  fundraiser_age_divisions?: FundraiserAgeDivision[];
  status: string;
  created_at: string;
}
