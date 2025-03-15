
import { useProductCustomization } from "./product/useProductCustomization";
import { useQuantityManager } from "./product/useQuantityManager";
import { useProductActions } from "./product/useProductActions";

export const useProductForm = () => {
  const customization = useProductCustomization();
  const quantityManager = useQuantityManager();
  
  const productActions = useProductActions({
    imagePreview: customization.imagePreview,
    teamName: customization.teamName,
    teamLocation: customization.teamLocation,
    quantity: quantityManager.quantity
  });

  return {
    ...customization,
    ...quantityManager,
    ...productActions,
  };
};
