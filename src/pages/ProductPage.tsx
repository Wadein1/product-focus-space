
import React from "react";
import { ProductAnimation } from "@/components/product-animation/ProductAnimation";

const ProductPage = () => {
  // Store current page for cart navigation
  React.useEffect(() => {
    sessionStorage.setItem('previousPage', '/product');
  }, []);

  return <ProductAnimation />;
};

export default ProductPage;
