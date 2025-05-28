
import { useState } from "react";
import { useImageUpload } from "../useImageUpload";
import { useToast } from "../use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useProductCustomization = () => {
  const [teamName, setTeamName] = useState("");
  const [teamLocation, setTeamLocation] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showDiscountAnimation, setShowDiscountAnimation] = useState(false);
  const { uploadImage, isUploading } = useImageUpload();
  const { toast } = useToast();

  const handleFileChange = async (file: File) => {
    try {
      if (file) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const dataUrl = reader.result as string;
          
          try {
            const imageUrl = await uploadImage(dataUrl);
            console.log('Image uploaded successfully, updating state with URL:', imageUrl);
            setImagePreview(imageUrl);
            setTeamName("");
            setTeamLocation("");
            
            const { error: dbError } = await supabase
              .from('gallery_images')
              .insert({
                image_path: imageUrl,
                title: 'Custom Design Upload',
                description: 'User uploaded custom design'
              });
            
            if (dbError) {
              console.error('Error saving to gallery:', dbError);
            }
            
            toast({
              title: "Image uploaded",
              description: "Your design has been uploaded successfully",
            });
          } catch (error) {
            console.error('Upload failed:', error);
            toast({
              title: "Error",
              description: "Failed to upload image",
              variant: "destructive",
            });
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error handling file:', error);
      throw error;
    }
  };

  const removeImage = () => {
    setImagePreview(null);
  };

  return {
    teamName,
    setTeamName,
    teamLocation,
    setTeamLocation,
    imagePreview,
    setImagePreview,
    showDiscountAnimation,
    setShowDiscountAnimation,
    handleFileChange,
    removeImage,
    isUploading,
  };
};
