-- Fix security issues: Enable RLS on fundraiser_age_divisions and fundraiser_teams tables

-- Enable RLS on fundraiser_age_divisions table
ALTER TABLE public.fundraiser_age_divisions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on fundraiser_teams table
ALTER TABLE public.fundraiser_teams ENABLE ROW LEVEL SECURITY;

-- Drop and recreate fundraiser_summary view without SECURITY DEFINER
DROP VIEW IF EXISTS public.fundraiser_summary;

-- Recreate view without SECURITY DEFINER property
CREATE VIEW public.fundraiser_summary AS
SELECT 
    f.id as fundraiser_id,
    f.title,
    f.description,
    COALESCE(SUM(fo.donation_amount), 0) as total_raised,
    COUNT(DISTINCT fo.order_id) as total_orders
FROM fundraisers f
LEFT JOIN fundraiser_orders fo ON f.id = fo.fundraiser_id
GROUP BY f.id, f.title, f.description;