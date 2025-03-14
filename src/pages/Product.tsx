
import React, { useEffect, useState, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const Product = () => {
  const [animationStage, setAnimationStage] = useState(0);
  const isMobile = useIsMobile();
  const yourRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  
  // Control the animation sequence
  useEffect(() => {
    // Stage 0: Initial stage (words coming in)
    // Stage 1: Words centered
    // Stage 2: "Your" changes to white
    // Stage 3: Words separate
    
    // Initial animation (coming together)
    setTimeout(() => setAnimationStage(1), 800);
    
    // Words stay centered for 0.2 seconds
    setTimeout(() => setAnimationStage(2), 1000);
    
    // "Your" changes to white
    setTimeout(() => setAnimationStage(3), 1200);
    
    // Words separate
    setTimeout(() => setAnimationStage(4), 1400);
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        {/* "Your" text */}
        <div 
          ref={yourRef}
          className={`text-5xl md:text-7xl font-bold transition-all duration-800 ease-out font-[Montserrat] z-10
            ${animationStage === 0 ? 'opacity-0 -translate-y-20' : 'opacity-100 translate-y-0'} 
            ${animationStage >= 2 ? 'text-white' : 'text-primary'} 
            ${animationStage >= 3 ? 'md:-translate-y-[17.5vh]' : ''}`}
          style={{
            transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)"
          }}
        >
          Your
        </div>
        
        {/* "Logo" text */}
        <div 
          ref={logoRef}
          className={`text-5xl md:text-7xl font-bold text-white transition-all duration-800 ease-out font-[Montserrat]
            ${animationStage === 0 ? 'opacity-0 translate-y-20' : 'opacity-100 translate-y-0'} 
            ${animationStage >= 3 ? 'md:translate-y-[17.5vh]' : ''}`}
          style={{
            transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)"
          }}
        >
          Logo
        </div>
      </div>
    </div>
  );
};

export default Product;
