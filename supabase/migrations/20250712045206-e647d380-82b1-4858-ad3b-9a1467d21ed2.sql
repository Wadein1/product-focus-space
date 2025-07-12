-- Fix security definer view issue by using security_invoker=on

-- Drop the existing fundraiser_summary view
DROP VIEW IF EXISTS public.fundraiser_summary;

-- Create a new secure view with security_invoker=on
CREATE VIEW public.fundraiser_summary
WITH (security_invoker=on)
AS
SELECT 
    f.id as fundraiser_id,
    f.title,
    f.description,
    COALESCE(SUM(fo.donation_amount), 0) as total_raised,
    COUNT(DISTINCT fo.order_id) as total_orders
FROM fundraisers f
LEFT JOIN fundraiser_orders fo ON f.id = fo.fundraiser_id
GROUP BY f.id, f.title, f.description;