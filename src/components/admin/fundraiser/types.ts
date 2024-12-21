export interface FundraiserFormData {
  title: string;
  description: string;
  customLink: string;
  basePrice: number;
  donationPercentage: number;
  variations: {
    title: string;
    image: File | null;
  }[];
}