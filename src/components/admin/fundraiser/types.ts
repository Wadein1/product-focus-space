
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
