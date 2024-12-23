export type DonationType = 'percentage' | 'fixed';

export interface Fundraiser {
  id: string;
  created_at: string;
  title: string;
  description?: string | null;
  custom_link: string;
  base_price: number;
  donation_percentage: number;
  donation_type: DonationType;
  donation_amount?: number | null;
  status: string;
}