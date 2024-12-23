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
    image: z.any()
  }))
});

export type FundraiserFormData = z.infer<typeof fundraiserFormSchema>;

export interface Fundraiser {
  id: string;
  title: string;
  description: string | null;
  custom_link: string;
  base_price: number;
  donation_type: 'percentage' | 'fixed';
  donation_percentage: number | null;
  donation_amount: number | null;
  variations: Array<{
    id: string;
    title: string;
    image_path: string;
  }>;
}