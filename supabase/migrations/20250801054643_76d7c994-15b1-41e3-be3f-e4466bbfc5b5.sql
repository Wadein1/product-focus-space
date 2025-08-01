-- Add shipping control columns to fundraisers table
ALTER TABLE public.fundraisers 
ADD COLUMN IF NOT EXISTS allow_team_shipping boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_regular_shipping boolean DEFAULT true;