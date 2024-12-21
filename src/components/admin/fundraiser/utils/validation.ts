import { supabase } from "@/integrations/supabase/client";

export const validateCustomLink = async (customLink: string) => {
  const { data, error } = await supabase
    .from('fundraisers')
    .select('custom_link')
    .eq('custom_link', customLink)
    .maybeSingle();

  if (error) {
    console.error('Error checking custom link:', error);
    return "Error validating custom link. Please try again.";
  }

  if (data) {
    return "This custom link is already taken. Please choose another one.";
  }

  return true;
};