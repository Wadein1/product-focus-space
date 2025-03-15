import React, { useState, useEffect } from "react";
import { useProductForm } from "@/hooks/useProductForm";
import { ArrowRight, Upload, Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const Customize = () => {
  const productForm = useProductForm();
  const [step, setStep] = useState(1);
  const [animationState, setAnimationState] = useState("entering"); // entering, idle, exiting
  const [isValid, setIsValid] = useState(false);
  const [showPriceAnimation, setShowPriceAnimation] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  
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

  // Animation sequence for price reveal
  useEffect(() => {
    if (showPriceAnimation) {
      const sequence = [
        { step: 1, delay: 0 },     // Show initial price
        { step: 2, delay: 1200 },  // Start strikethrough animation
        { step: 3, delay: 800 },   // Show discounted price
        { step: 4, delay: 1500 }   // Complete animation and proceed
      ];

      let timeoutId: NodeJS.Timeout;
      
      sequence.forEach(({ step, delay }, index) => {
        const cumulativeDelay = sequence.slice(0, index).reduce((acc, curr) => acc + curr.delay, 0);
        
        timeoutId = setTimeout(() => {
          setAnimationStep(step);
          
          if (step === sequence.length) {
            setTimeout(() => {
              setShowPriceAnimation(false);
              setAnimationStep(0);
              setStep(3);
              setAnimationState("entering");
              setTimeout(() => {
                setAnimationState("idle");
              }, 800);
            }, 600);
          }
        }, cumulativeDelay);
      });
      
      return () => clearTimeout(timeoutId);
    }
  }, [showPriceAnimation]);
  
  // Handle next step with animations
  const handleNextStep = () => {
    if (!isValid) return;
    
    setAnimationState("exiting");
    
    setTimeout(() => {
      if (step === 2) {
        setShowPriceAnimation(true);
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
            {animationStep === 1 && (
              <div className="text-white text-6xl md:text-8xl font-bold animate-fade-in">$49.99</div>
            )}
            {animationStep === 2 && (
              <div className="relative">
                <div className="text-white text-6xl md:text-8xl font-bold relative">
                  $49.99
                  <div className="absolute top-1/2 left-0 w-0 h-1 bg-red-500 transform -rotate-12 animate-[strikethrough_0.8s_forwards]"></div>
                </div>
              </div>
            )}
            {animationStep === 3 && (
              <div className="relative">
                <div className="text-white text-6xl md:text-8xl font-bold opacity-50 relative">
                  $49.99
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-red-500 transform -rotate-12"></div>
                </div>
                <div className="text-[#00bf63] text-6xl md:text-8xl font-bold mt-4 animate-[bounce-in_0.6s_cubic-bezier(0.25,0.46,0.45,0.94)]">$29.99</div>
              </div>
            )}
            {animationStep === 4 && (
              <div className="relative animate-[fade-out_0.6s_forwards]">
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
                        'bg-transparent' : 
                        'bg-gray-900/40 border-2 border-dashed border-gray-700 hover:border-[#0ca2ed] hover:bg-gray-900/60'}`}
                  >
                    {productForm.imagePreview ? (
                      <div className="w-full h-full p-4">
                        <div className="relative w-full h-full">
                          <div className="absolute inset-0 bg-white opacity-20 rounded-xl"></div>
                          <img 
                            src={productForm.imagePreview} 
                            alt="Preview" 
                            className="w-full h-full object-contain relative z-10 rounded-xl border-2 border-white" 
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl z-20">
                            <p className="text-white font-medium">Replace image</p>
                          </div>
                          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-[#00bf63] text-white px-3 py-1 rounded-full flex items-center text-sm z-30">
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
                    <div className="flex-grow h-[2px] bg-gray-700"></div>
                    <span className="px-6 text-gray-200 text-2xl font-bold">OR</span>
                    <div className="flex-grow h-[2px] bg-gray-700"></div>
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
              <div className="grid grid-cols-1 gap-8">
                <div>
                  <div className="mb-6">
                    <label className="block text-white font-medium mb-2">Quantity</label>
                    <div className="flex items-center justify-between w-full">
                      <button
                        type="button"
                        onClick={() => productForm.handleQuantityChange(false)}
                        className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg border border-gray-700 transition-colors w-16 h-16 flex items-center justify-center"
                      >
                        <Minus size={20} />
                      </button>
                      <span className="bg-gray-900/60 text-white py-3 px-6 rounded-lg border border-gray-700 text-xl font-medium w-24 text-center">
                        {productForm.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => productForm.handleQuantityChange(true)}
                        className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg border border-gray-700 transition-colors w-16 h-16 flex items-center justify-center"
                      >
                        <Plus size={20} />
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
                    <div className="mb-4 flex items-center justify-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-white opacity-20 rounded-xl"></div>
                        <img 
                          src={productForm.imagePreview} 
                          alt="Your design" 
                          className="w-full h-64 object-contain rounded-xl border-2 border-white relative z-10" 
                        />
                      </div>
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

      {/* Add animation keyframes */}
      <style>
        {`
        @keyframes strikethrough {
          0% { width: 0; }
          100% { width: 100%; }
        }
        
        @keyframes bounce-in {
          0% { 
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        
        @keyframes fade-out {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        `}
      </style>
    </div>
  );
};

export default Customize;
