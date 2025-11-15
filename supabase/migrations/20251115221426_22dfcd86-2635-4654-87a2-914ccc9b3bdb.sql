-- Add school mode and big school fields to fundraisers table
ALTER TABLE fundraisers
ADD COLUMN school_mode boolean DEFAULT false,
ADD COLUMN big_school boolean DEFAULT false;