import { supabase } from "@/integrations/supabase/client";

export const uploadFile = async (file: File, bucket: string) => {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    return filePath;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};