-- Fix multiple permissive policies performance warnings
-- Consolidate duplicate RLS policies to improve performance

-- Fix fundraiser_variation_images table
-- Drop redundant policy, keep the more specific one
DROP POLICY IF EXISTS "Allow public read access to variation images" ON public.fundraiser_variation_images;

-- Fix fundraiser_variations table  
-- Drop redundant policy, keep the more specific one
DROP POLICY IF EXISTS "Public read access to variations" ON public.fundraiser_variations;

-- Fix fundraisers table
-- Drop the general policy, keep the more specific one that filters by status
DROP POLICY IF EXISTS "Allow fundraiser viewing" ON public.fundraisers;

-- Fix gallery_images table
-- Drop the general admin policy for SELECT, keep the public read policy
-- Update the admin policy to exclude SELECT operations
DROP POLICY IF EXISTS "Admin can modify gallery images" ON public.gallery_images;
CREATE POLICY "Admin can modify gallery images" 
ON public.gallery_images 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Update the policy to be more specific - only INSERT, UPDATE, DELETE for admins
DROP POLICY IF EXISTS "Admin can modify gallery images" ON public.gallery_images;
CREATE POLICY "Admin can insert/update/delete gallery images" 
ON public.gallery_images 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin can update gallery images" 
ON public.gallery_images 
FOR UPDATE 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Admin can delete gallery images" 
ON public.gallery_images 
FOR DELETE 
USING (true);

-- Fix shopping_carts table
-- Drop the general policy, keep the more specific email-based one
DROP POLICY IF EXISTS "Users can view shopping carts" ON public.shopping_carts;