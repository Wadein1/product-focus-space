import React from 'react';
import Navbar from '../components/Navbar';

const Product = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Product Image */}
          <div className="aspect-square rounded-lg overflow-hidden">
            <img
              src="/lovable-uploads/c3b67733-225f-4e30-9363-e13d20ed3100.png"
              alt="Product"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight">Premium Drip Collection</h1>
            <p className="text-lg text-gray-600">
              Experience the ultimate in style and comfort with our exclusive drip collection.
              Perfect for any application, designed for those who appreciate quality.
            </p>
            <div className="border-t border-b py-4">
              <h2 className="text-xl font-semibold mb-2">Features:</h2>
              <ul className="space-y-2 text-gray-600">
                <li>• Premium quality materials</li>
                <li>• Versatile design</li>
                <li>• Perfect fit guarantee</li>
                <li>• Exclusive limited edition</li>
              </ul>
            </div>
            <div className="space-y-4">
              <p className="text-2xl font-bold">$199.99</p>
              <button className="button-primary w-full">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;