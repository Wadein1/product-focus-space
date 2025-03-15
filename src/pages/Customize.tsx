
import React, { useState, useEffect } from "react";
import { useProductForm } from "@/hooks/useProductForm";
import { ArrowRight, Upload, Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Customize = () => {
  const productForm = useProductForm();
  const [step, setStep] = useState(1);
  const [animationState, setAnimationState] = useState("entering"); // entering, idle, exiting
  const [isValid, setIsValid] = useState(false);
  const [showPriceAnimation, setShowPriceAnimation] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  
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
      if (step === 2) {
        setShowPriceAnimation(true);
        setTimeout(() => {
          setAnimationComplete(true);
          setTimeout(() => {
            setShowPriceAnimation(false);
            setAnimationComplete(false);
            setStep(3);
            setAnimationState("entering");
            setTimeout(() => {
              setAnimationState("idle");
            }, 800);
          }, 2000);
        }, 1500);
      } else {
        setStep((prevStep) => prevStep + 1);
        setAnimationState("entering");
        setTimeout(() => {
          setAnimationState("idle");
        }, 800);
      }
    }, 800);
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      productForm.handleFileChange(e.target.files[0]);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col justify-between overflow-hidden" 
      style={{ 
        background: "#000000",
        backgroundSize: "cover",
        backgroundAttachment: "fixed" 
      }}>
      {showPriceAnimation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black">
          <div className="text-center">
            {!animationComplete ? (
              <div className="text-white text-6xl md:text-8xl font-bold">$49.99</div>
            ) : (
              <div className="relative">
                <div className="text-white text-6xl md:text-8xl font-bold opacity-50 relative">
                  $49.99
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-red-500 transform -rotate-12"></div>
                </div>
                <div className="text-[#00bf63] text-6xl md:text-8xl font-bold mt-4">$29.99</div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 flex-grow flex items-center justify-center">
        <div className={`w-full max-w-4xl transition-all duration-800 ease-out transform 
          ${animationState === "entering" ? "translate-x-[100%] opacity-0" : 
            animationState === "exiting" ? "translate-x-[-100%] opacity-0" : 
            "translate-x-0 opacity-100"}`}
        >
          {step === 1 && (
            <div className="space-y-8">
              <div className="mb-8 flex flex-col md:flex-row gap-8">
                {/* Modern upload design box */}
                <div className="w-full md:w-1/2">
                  <input 
                    type="file" 
                    id="design-upload" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileInputChange}
                  />
                  <label 
                    htmlFor="design-upload" 
                    className={`cursor-pointer flex flex-col items-center justify-center h-64 rounded-xl transition-all duration-300 
                      ${productForm.imagePreview ? 
                        'bg-gray-900/40 border border-gray-700' : 
                        'bg-gray-900/40 border-2 border-dashed border-gray-700 hover:border-[#0ca2ed] hover:bg-gray-900/60'}`}
                  >
                    {productForm.imagePreview ? (
                      <div className="w-full h-full p-4">
                        <div className="relative w-full h-full">
                          <img 
                            src={productForm.imagePreview} 
                            alt="Preview" 
                            className="w-full h-full object-contain" 
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-md">
                            <p className="text-white font-medium">Replace image</p>
                          </div>
                          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-[#00bf63] text-white px-3 py-1 rounded-full flex items-center text-sm">
                            <Check className="mr-1" size={14} /> Uploaded
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-16 h-16 bg-gray-800/80 rounded-full flex items-center justify-center mb-4">
                          <Upload className="w-8 h-8 text-[#0ca2ed]" />
                        </div>
                        <p className="text-[#0ca2ed] text-sm">Upload your logo</p>
                      </div>
                    )}
                  </label>
                </div>
                
                {/* Team info section */}
                <div className="w-full md:w-1/2 space-y-4">
                  <div className="flex items-center my-6 md:my-8">
                    <div className="flex-grow h-px bg-gray-700"></div>
                    <span className="px-6 text-gray-200 text-xl font-bold">OR</span>
                    <div className="flex-grow h-px bg-gray-700"></div>
                  </div>
                  
                  <input
                    type="text"
                    value={productForm.teamName}
                    onChange={(e) => productForm.setTeamName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-900/40 text-white border border-gray-700 focus:border-[#0ca2ed] focus:ring-1 focus:ring-[#0ca2ed] outline-none transition-colors"
                    placeholder="Team Name"
                    disabled={!!productForm.imagePreview}
                  />
                  
                  <input
                    type="text"
                    value={productForm.teamLocation}
                    onChange={(e) => productForm.setTeamLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-900/40 text-white border border-gray-700 focus:border-[#0ca2ed] focus:ring-1 focus:ring-[#0ca2ed] outline-none transition-colors"
                    placeholder="Team Location"
                    disabled={!!productForm.imagePreview}
                  />
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button 
                  onClick={handleNextStep}
                  disabled={!isValid}
                  className={`px-6 py-3 flex items-center justify-center rounded-lg transition-all duration-300 ${
                    isValid 
                      ? "bg-[#00bf63] hover:bg-[#00bf63]/90 text-white" 
                      : "bg-gray-800 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Next <ArrowRight className="ml-2" size={18} />
                </Button>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-900/40 p-6 rounded-xl border border-gray-800">
                  {productForm.imagePreview ? (
                    <div className="mb-4">
                      <img 
                        src={productForm.imagePreview} 
                        alt="Your design" 
                        className="w-full h-64 object-contain" 
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-800/60 rounded-lg mb-4 h-64 flex items-center justify-center">
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
                    <label className="block text-white font-medium mb-2">Chain Links Color</label>
                    <Select
                      value={productForm.selectedChainColor}
                      onValueChange={productForm.setSelectedChainColor}
                    >
                      <SelectTrigger className="bg-gray-900/60 border border-gray-700 text-white">
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border border-gray-700 text-white">
                        <SelectItem value="Designers' Choice" className="hover:bg-gray-700">Designer's Choice</SelectItem>
                        {productForm.chainColors.map((color) => (
                          <SelectItem key={color.id} value={color.name} className="hover:bg-gray-700">
                            {color.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-white font-medium mb-2">Quantity</label>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => productForm.handleQuantityChange(false)}
                        className="bg-gray-800 text-white p-2 rounded-l-lg border border-gray-700"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="bg-gray-900/40 text-white py-2 px-4 border-t border-b border-gray-700">
                        {productForm.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => productForm.handleQuantityChange(true)}
                        className="bg-gray-800 text-white p-2 rounded-r-lg border border-gray-700"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <Button 
                      onClick={() => {
                        setAnimationState("exiting");
                        setTimeout(() => {
                          setStep(1);
                          setAnimationState("entering");
                          setTimeout(() => setAnimationState("idle"), 800);
                        }, 800);
                      }}
                      className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleNextStep}
                      className="px-6 py-3 flex-1 bg-[#00bf63] hover:bg-[#00bf63]/90 text-white rounded-lg"
                    >
                      Next <ArrowRight className="ml-2" size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-900/40 p-6 rounded-xl border border-gray-800">
                  {productForm.imagePreview ? (
                    <div className="mb-4">
                      <img 
                        src={productForm.imagePreview} 
                        alt="Your design" 
                        className="w-full h-64 object-contain" 
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-800/60 rounded-lg mb-4 h-64 flex items-center justify-center">
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
                      <span className="font-medium">Chain Links Color:</span> {productForm.selectedChainColor}
                    </p>
                    <p>
                      <span className="font-medium">Quantity:</span> {productForm.quantity}
                    </p>
                  </div>
                </div>
                
                <div>
                  <div className="bg-gray-900/40 p-6 rounded-xl border border-gray-800 mb-6">
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
                      <div className="flex justify-between border-t border-gray-700 pt-4">
                        <span className="font-medium">Subtotal</span>
                        <span>${(29.99 * productForm.quantity).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>$8.00</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-700 pt-4 text-lg font-bold">
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
                  
                  <div className="mt-6 flex justify-center">
                    <Button 
                      onClick={() => {
                        setAnimationState("exiting");
                        setTimeout(() => {
                          setStep(2);
                          setAnimationState("entering");
                          setTimeout(() => setAnimationState("idle"), 800);
                        }, 800);
                      }}
                      className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
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
      
      {/* Modern step indicator with thin lines */}
      <div className="py-6 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center space-x-4">
            <div className={`h-1 w-24 md:w-32 rounded-full transition-colors duration-300 ${step >= 1 ? "bg-[#00bf63]" : "bg-gray-700"}`}></div>
            <div className={`h-1 w-24 md:w-32 rounded-full transition-colors duration-300 ${step >= 2 ? "bg-[#00bf63]" : "bg-gray-700"}`}></div>
            <div className={`h-1 w-24 md:w-32 rounded-full transition-colors duration-300 ${step >= 3 ? "bg-[#00bf63]" : "bg-gray-700"}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customize;
