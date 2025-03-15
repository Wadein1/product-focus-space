
import { useState } from "react";

export const useQuantityManager = () => {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (increment: boolean) => {
    setQuantity(prev => increment ? prev + 1 : Math.max(1, prev - 1));
  };

  const setSpecificQuantity = (value: number) => {
    setQuantity(Math.max(1, value));
  };

  return {
    quantity,
    handleQuantityChange,
    setSpecificQuantity
  };
};
