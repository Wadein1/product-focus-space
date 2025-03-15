
import React, { useState, useEffect } from "react";
import { useProductForm } from "@/hooks/useProductForm";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";

const Customize = () => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const productForm = useProductForm();
  
  // Animation when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelector('.customize-container')?.classList.add('entered');
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    setDirection(1);
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setDirection(-1);
    setStep(step - 1);
  };

  // Animation variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4 flex flex-col items-center justify-between">
      <div className="w-full max-w-4xl mx-auto customize-container opacity-0 transition-opacity duration-500 ease-out">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="w-full"
            >
              <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-white mb-4">Customize Your Medallion</h1>
                <p className="text-gray-300 text-lg">Upload your design or enter your team details</p>
              </div>

              <div className="bg-gray-900/80 rounded-2xl p-6 md:p-8 shadow-xl mb-8 border border-gray-800">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-4">Upload Your Design</h2>
                  <div className="border-2 border-dashed border-primary/50 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer bg-gray-800/50">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) productForm.handleFileChange(file);
                      }}
                      className="hidden"
                      id="designUpload"
                      disabled={!!productForm.teamName || !!productForm.teamLocation}
                    />
                    <label htmlFor="designUpload" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 border border-primary/40">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </div>
                        <span className="text-white font-medium">Click to upload</span>
                        <span className="text-primary/80 text-sm mt-1">SVG, PNG, JPG (max. 5MB)</span>
                      </div>
                    </label>
                    {productForm.imagePreview && (
                      <div className="mt-4">
                        <div className="relative w-32 h-32 mx-auto">
                          <img 
                            src={productForm.imagePreview} 
                            alt="Preview" 
                            className="w-full h-full object-contain rounded-lg border border-primary/30" 
                          />
                          <button 
                            onClick={() => {
                              if (productForm.imagePreview) {
                                productForm.setImagePreview(null);
                              }
                            }}
                            className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1 hover:bg-primary/80 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative flex items-center justify-center py-4">
                  <div className="flex-grow border-t border-gray-600"></div>
                  <span className="mx-4 flex-shrink-0 text-primary text-lg font-medium">OR</span>
                  <div className="flex-grow border-t border-gray-600"></div>
                </div>

                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-4">Enter Team Details</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="teamName" className="block text-white text-sm font-medium mb-2">
                        Team Name
                      </label>
                      <Input
                        id="teamName"
                        type="text"
                        placeholder="Enter your team name"
                        value={productForm.teamName}
                        onChange={(e) => productForm.setTeamName(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white focus:ring-primary focus:border-primary placeholder:text-gray-500"
                        disabled={!!productForm.imagePreview}
                      />
                    </div>
                    <div>
                      <label htmlFor="teamLocation" className="block text-white text-sm font-medium mb-2">
                        Team Location
                      </label>
                      <Input
                        id="teamLocation"
                        type="text"
                        placeholder="City, State"
                        value={productForm.teamLocation}
                        onChange={(e) => productForm.setTeamLocation(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white focus:ring-primary focus:border-primary placeholder:text-gray-500"
                        disabled={!!productForm.imagePreview}
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleNext} 
                  className="w-full py-6 text-lg font-semibold bg-primary hover:bg-primary/90 text-white"
                  disabled={(!productForm.imagePreview && (!productForm.teamName || !productForm.teamLocation))}
                >
                  Next <ArrowRight className="ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
          
          {/* We'll add steps 2 and 3 later */}
        </AnimatePresence>
      </div>
      
      {/* Step indicator */}
      <div className="w-full max-w-4xl mx-auto mt-8 flex justify-center space-x-2">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className={`h-1 rounded-full transition-all duration-300 ${
              i === step 
                ? 'w-16 bg-[#00bf63]' 
                : i < step 
                  ? 'w-16 bg-[#00bf63]' 
                  : 'w-16 bg-white opacity-50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Customize;
