
import React from "react";
import { LogoAnimation } from "@/components/product/LogoAnimation";

const Product = () => {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap"
        rel="stylesheet"
      />
      <div className="min-h-screen bg-black">
        <LogoAnimation />
      </div>
    </>
  );
};

export default Product;
