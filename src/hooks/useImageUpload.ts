import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (dataUrl: string): Promise<string> => {
    setIsUploading(true);
    try {
      // Convert data URL to Blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Generate a unique filename
      const filename = `${uuidv4()}.${blob.type.split('/')[1]}`;
      const filePath = `product-images/${filename}`;

      // Upload to Supabase storage with retries
      let attempts = 0;
      const maxAttempts = 3;
      let uploadError = null;

      while (attempts < maxAttempts) {
        const { error } = await supabase.storage
          .from('gallery')
          .upload(filePath, blob, {
            cacheControl: '3600',
            upsert: false,
            contentType: blob.type
          });

        if (!error) {
          // Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('gallery')
            .getPublicUrl(filePath);

          console.log('Image uploaded successfully:', publicUrl);
          return publicUrl;
        }

        uploadError = error;
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Exponential backoff
        }
      }

      throw uploadError;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    isUploading
  };
};