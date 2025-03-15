
import React, { useState, useEffect } from "react";
import { useProductForm } from "@/hooks/useProductForm";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductDetails } from "@/components/product/ProductDetails";
import { ArrowRight, Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Customize = () => {
  const productForm = useProductForm();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [animationState, setAnimationState] = useState("entering"); // entering, idle, exiting
  const [isValid, setIsValid] = useState(false);
  
  // Check if the form is valid to enable the Next button
  useEffect(() => {
    if (productForm.imagePreview || (productForm.teamName && productForm.teamLocation)) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [productForm.imagePreview, productForm.teamName, productForm.teamLocation]);
  
  // Set initial animation state
  useEffect(() => {
    // Set a timeout to change animation state to idle
    const timer = setTimeout(() => {
      setAnimationState("idle");
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle next step with animations
  const handleNextStep = () => {
    if (!isValid) return;
    
    setAnimationState("exiting");
    
    setTimeout(() => {
      setStep((prevStep) => prevStep + 1);
      setAnimationState("entering");
      
      setTimeout(() => {
        setAnimationState("idle");
      }, 800);
    }, 800);
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      productForm.handleFileChange(e.target.files[0]);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col justify-between" 
         style={{ 
           background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
           backgroundSize: "cover",
           backgroundAttachment: "fixed" 
         }}>
      <div className="container mx-auto px-4 py-12 flex-grow flex items-center justify-center">
        <div className={`max-w-5xl w-full transition-all duration-800 ease-out transform 
          ${animationState === "entering" ? "translate-x-[100%] opacity-0" : 
            animationState === "exiting" ? "translate-x-[-100%] opacity-0" : 
            "translate-x-0 opacity-100"}`}
        >
          <h1 className="text-3xl font-bold mb-8 text-center text-white">Customize Your Medallion</h1>
          
          {step === 1 && (
            <div className="bg-[#1e293b]/70 backdrop-blur-sm rounded-xl shadow-xl p-8 md:p-10">
              <h2 className="text-2xl font-semibold mb-6 text-white">Upload Your Design</h2>
              
              <div className="mb-8 border-2 border-dashed border-gray-400 rounded-lg p-8 text-center hover:border-[#0ca2ed] transition-colors duration-300">
                <input 
                  type="file" 
                  id="design-upload" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileInputChange}
                />
                <label 
                  htmlFor="design-upload" 
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  {productForm.imagePreview ? (
                    <div className="w-full">
                      <div className="relative w-64 h-64 mx-auto mb-4">
                        <img 
                          src={productForm.imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-contain rounded-md" 
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-md">
                          <p className="text-white font-medium">Click to change</p>
                        </div>
                      </div>
                      <p className="text-green-400 flex items-center justify-center">
                        <Check className="mr-2" size={18} /> Image uploaded successfully
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-16 h-16 text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-white mb-2">Drag and drop or click to upload</p>
                      <p className="text-gray-400 mb-4">PNG, JPG or SVG (max 10MB)</p>
                      <Button className="bg-[#0ca2ed] hover:bg-[#0ca2ed]/80 text-white">
                        Select File
                      </Button>
                    </>
                  )}
                </label>
              </div>
              
              <div className="flex items-center my-8">
                <div className="flex-grow h-px bg-gray-600"></div>
                <span className="px-4 text-gray-400 font-medium">OR</span>
                <div className="flex-grow h-px bg-gray-600"></div>
              </div>
              
              <div className="space-y-6 mb-8">
                <div>
                  <label htmlFor="team-name" className="block text-white font-medium mb-2">Team Name</label>
                  <input
                    id="team-name"
                    type="text"
                    value={productForm.teamName}
                    onChange={(e) => productForm.setTeamName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-[#0ca2ed] focus:ring-1 focus:ring-[#0ca2ed] outline-none transition-colors"
                    placeholder="Enter your team name"
                  />
                </div>
                
                <div>
                  <label htmlFor="team-location" className="block text-white font-medium mb-2">Team Location</label>
                  <input
                    id="team-location"
                    type="text"
                    value={productForm.teamLocation}
                    onChange={(e) => productForm.setTeamLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-[#0ca2ed] focus:ring-1 focus:ring-[#0ca2ed] outline-none transition-colors"
                    placeholder="Enter your team location"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleNextStep}
                  disabled={!isValid}
                  className={`px-6 py-3 flex items-center justify-center rounded-lg transition-all duration-300 ${
                    isValid 
                      ? "bg-[#00bf63] hover:bg-[#00bf63]/90 text-white" 
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Next Step <ArrowRight className="ml-2" size={18} />
                </Button>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="bg-[#1e293b]/70 backdrop-blur-sm rounded-xl shadow-xl p-8 md:p-10">
              <h2 className="text-2xl font-semibold mb-6 text-white">Choose Chain Color</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-800/50 p-6 rounded-lg">
                  {productForm.imagePreview ? (
                    <div className="mb-4">
                      <img 
                        src={productForm.imagePreview} 
                        alt="Your design" 
                        className="w-full h-64 object-contain rounded-md" 
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-700 p-6 rounded-lg mb-4 h-64 flex items-center justify-center">
                      <p className="text-white text-lg">
                        {productForm.teamName && productForm.teamLocation ? (
                          <>
                            <span className="font-bold block text-xl">{productForm.teamName}</span>
                            <span className="text-gray-400">{productForm.teamLocation}</span>
                          </>
                        ) : (
                          <span className="text-gray-400">No image uploaded</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="mb-6">
                    <label className="block text-white font-medium mb-2">Chain Color</label>
                    <div className="grid grid-cols-2 gap-4">
                      {productForm.chainColors.map((color) => (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => productForm.setSelectedChainColor(color.name)}
                          className={`p-4 rounded-lg border transition-all ${
                            productForm.selectedChainColor === color.name
                              ? "border-[#0ca2ed] bg-gray-700"
                              : "border-gray-600 bg-gray-800/50 hover:border-gray-400"
                          }`}
                        >
                          <span className="text-white">{color.name}</span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => productForm.setSelectedChainColor("Designers' Choice")}
                        className={`p-4 rounded-lg border transition-all ${
                          productForm.selectedChainColor === "Designers' Choice"
                            ? "border-[#0ca2ed] bg-gray-700"
                            : "border-gray-600 bg-gray-800/50 hover:border-gray-400"
                        }`}
                      >
                        <span className="text-white">Designers' Choice</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button 
                      onClick={() => {
                        setAnimationState("exiting");
                        setTimeout(() => {
                          setStep(1);
                          setAnimationState("entering");
                          setTimeout(() => setAnimationState("idle"), 800);
                        }, 800);
                      }}
                      className="px-6 py-3 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleNextStep}
                      className="px-6 py-3 flex-1 flex items-center justify-center bg-[#00bf63] hover:bg-[#00bf63]/90 text-white rounded-lg"
                    >
                      Next Step <ArrowRight className="ml-2" size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="bg-[#1e293b]/70 backdrop-blur-sm rounded-xl shadow-xl p-8 md:p-10">
              <h2 className="text-2xl font-semibold mb-6 text-white">Review and Purchase</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-800/50 p-6 rounded-lg">
                  {productForm.imagePreview ? (
                    <div className="mb-4">
                      <img 
                        src={productForm.imagePreview} 
                        alt="Your design" 
                        className="w-full h-64 object-contain rounded-md" 
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-700 p-6 rounded-lg mb-4 h-64 flex items-center justify-center">
                      <p className="text-white text-lg">
                        {productForm.teamName && productForm.teamLocation ? (
                          <>
                            <span className="font-bold block text-xl">{productForm.teamName}</span>
                            <span className="text-gray-400">{productForm.teamLocation}</span>
                          </>
                        ) : (
                          <span className="text-gray-400">No image uploaded</span>
                        )}
                      </p>
                    </div>
                  )}
                  
                  <div className="text-white">
                    <p className="mb-2">
                      <span className="font-medium">Chain Color:</span> {productForm.selectedChainColor}
                    </p>
                    <p>
                      <span className="font-medium">Quantity:</span> {productForm.quantity}
                    </p>
                  </div>
                </div>
                
                <div>
                  <div className="bg-gray-800/50 p-6 rounded-lg mb-6">
                    <h3 className="text-xl font-semibold mb-4 text-white">Order Summary</h3>
                    <div className="space-y-4 text-white">
                      <div className="flex justify-between">
                        <span>Custom Medallion</span>
                        <span>$29.99</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quantity</span>
                        <span>x{productForm.quantity}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-600 pt-4">
                        <span className="font-medium">Subtotal</span>
                        <span>${(29.99 * productForm.quantity).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>$8.00</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-600 pt-4 text-lg font-bold">
                        <span>Total</span>
                        <span>${(29.99 * productForm.quantity + 8).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Button 
                      onClick={productForm.buyNow}
                      disabled={productForm.isProcessing}
                      className="w-full bg-[#0ca2ed] hover:bg-[#0ca2ed]/90 text-white px-6 py-3 rounded-lg font-medium"
                    >
                      {productForm.isProcessing ? 'Processing...' : 'Buy Now'}
                    </Button>
                    <Button 
                      onClick={productForm.addToCart}
                      disabled={productForm.isAddingToCart}
                      className="w-full border border-[#0ca2ed] bg-transparent hover:bg-[#0ca2ed]/10 text-[#0ca2ed] px-6 py-3 rounded-lg font-medium"
                    >
                      {productForm.isAddingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                    </Button>
                  </div>
                  
                  <div className="mt-6">
                    <Button 
                      onClick={() => {
                        setAnimationState("exiting");
                        setTimeout(() => {
                          setStep(2);
                          setAnimationState("entering");
                          setTimeout(() => setAnimationState("idle"), 800);
                        }, 800);
                      }}
                      className="px-6 py-3 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                    >
                      Back
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Step Indicator */}
      <div className="py-8 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium 
                ${step >= 1 ? "bg-[#00bf63]" : "bg-gray-600"}`}>
                1
              </div>
              <div className={`w-16 md:w-24 h-1 ${step > 1 ? "bg-[#00bf63]" : "bg-gray-600"}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium 
                ${step >= 2 ? "bg-[#00bf63]" : "bg-gray-600"}`}>
                2
              </div>
              <div className={`w-16 md:w-24 h-1 ${step > 2 ? "bg-[#00bf63]" : "bg-gray-600"}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium 
                ${step >= 3 ? "bg-[#00bf63]" : "bg-gray-600"}`}>
                3
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customize;
