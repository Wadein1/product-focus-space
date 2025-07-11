-- Create table for multiple images per fundraiser variation
CREATE TABLE public.fundraiser_variation_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  variation_id UUID NOT NULL,
  image_path TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  FOREIGN KEY (variation_id) REFERENCES public.fundraiser_variations(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.fundraiser_variation_images ENABLE ROW LEVEL SECURITY;

-- Create policies for image access
CREATE POLICY "Allow public read access to variation images" 
ON public.fundraiser_variation_images 
FOR SELECT 
USING (true);

CREATE POLICY "Allow variation image operations" 
ON public.fundraiser_variation_images 
FOR ALL 
USING (true);

-- Create index for better performance
CREATE INDEX idx_fundraiser_variation_images_variation_id ON public.fundraiser_variation_images(variation_id);
CREATE INDEX idx_fundraiser_variation_images_display_order ON public.fundraiser_variation_images(variation_id, display_order);

-- Migrate existing single images to new structure
INSERT INTO public.fundraiser_variation_images (variation_id, image_path, display_order)
SELECT id, image_path, 0
FROM public.fundraiser_variations 
WHERE image_path IS NOT NULL;

-- Add a comment to track the migration
COMMENT ON TABLE public.fundraiser_variation_images IS 'Stores multiple images per fundraiser variation to replace single image_path in fundraiser_variations';