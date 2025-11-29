-- Add school mode fields to fundraisers table
ALTER TABLE fundraisers 
ADD COLUMN IF NOT EXISTS school_mode boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS big_school boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS teacher_list jsonb DEFAULT '[]'::jsonb;

-- Add school mode metadata fields to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS school_mode boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS big_school boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS grade text,
ADD COLUMN IF NOT EXISTS teacher text,
ADD COLUMN IF NOT EXISTS homeroom_teacher text,
ADD COLUMN IF NOT EXISTS school_button_clicked boolean DEFAULT false;