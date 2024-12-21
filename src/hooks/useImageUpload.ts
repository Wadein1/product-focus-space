import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadImage = async (dataUrl: string): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);
    try {
      // Convert data URL to Blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Generate a unique filename
      const filename = `${uuidv4()}.${blob.type.split('/')[1]}`;
      const filePath = `product-images/${filename}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Simulate upload progress since we can't get real progress
      const simulateProgress = () => {
        setUploadProgress(prev => {
          if (prev < 90) return prev + 10;
          return prev;
        });
      };
      const progressInterval = setInterval(simulateProgress, 100);

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      // Complete the progress
      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log('Image uploaded successfully:', publicUrl);
      return publicUrl;
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
      setUploadProgress(0);
    }
  };

  return {
    uploadImage,
    isUploading,
    uploadProgress
  };
};