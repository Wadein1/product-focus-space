
import { useState } from "react";

export const useProductCustomization = () => {
  const [teamName, setTeamName] = useState("");
  const [teamLocation, setTeamLocation] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showDiscountAnimation, setShowDiscountAnimation] = useState(false);

  const handleFileChange = async (file: File) => {
    try {
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
          setTeamName("");
          setTeamLocation("");
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error handling file:', error);
      throw error;
    }
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
  };
};
