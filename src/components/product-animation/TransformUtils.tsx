
import { useIsMobile } from "@/hooks/use-mobile";

export const useTransformValues = () => {
  const isMobile = useIsMobile();

  const getUpperTransformValue = () => {
    if (isMobile) {
      return "translateY(-100px)";
    }
    return "translateX(-120%)"; // Changed from -200% to -120% for web version
  };

  const getLowerTransformValue = () => {
    if (isMobile) {
      return "translateY(100px)";
    }
    return "translateX(120%)"; // Changed from 200% to 120% for web version
  };

  return {
    getUpperTransformValue,
    getLowerTransformValue,
    isMobile
  };
};
