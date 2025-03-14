
import React, { useEffect, useState, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const Product = () => {
  const [animationStage, setAnimationStage] = useState(0);
  const isMobile = useIsMobile();
  const yourRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const logoImageRef = useRef<HTMLImageElement>(null);
  
  // Control the animation sequence with slower timings
  useEffect(() => {
    // Stage 0: Initial stage (words coming in) - takes 1 second
    // Stage 1: Words centered - stays for 0.7 seconds
    // Stage 2: "Your" changes to white (with slower color transition) - takes 0.5 seconds
    // Stage 3: Words separate - takes 0.5 seconds
    // Stage 4: Logo appears - with glitch effect
    
    // Initial animation (coming together) - 1 second
    setTimeout(() => setAnimationStage(1), 1000);
    
    // Words stay centered for 0.7 seconds
    setTimeout(() => setAnimationStage(2), 1700); // 1000 + 700
    
    // "Your" changes to white (with slower wipe transition)
    setTimeout(() => setAnimationStage(3), 2200); // 1700 + 500
    
    // Words separate and logo appears
    setTimeout(() => setAnimationStage(4), 2700); // 2200 + 500
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        {/* "Your" text */}
        <div 
          ref={yourRef}
          className={`text-5xl md:text-7xl font-bold transition-all duration-1000 ease-out font-[Montserrat] z-10
            ${animationStage === 0 ? 'opacity-0 -translate-y-20' : 'opacity-100 translate-y-0'} 
            ${animationStage >= 2 ? 'text-white' : 'text-primary'} 
            ${animationStage >= 3 ? (isMobile ? '-translate-y-[15vh]' : 'md:-translate-x-[10vw]') : ''}`}
          style={{
            transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)",
            transitionDuration: animationStage === 2 ? "500ms" : "1000ms" // Slower color transition
          }}
        >
          Your
        </div>
        
        {/* Logo image - appears during stage 4 */}
        {animationStage >= 4 && (
          <img 
            ref={logoImageRef}
            src="/lovable-uploads/c724ea2d-3b4d-439b-9628-99d3c7d461a4.png"
            alt="Logo"
            className={`absolute logo-glitch z-20 w-24 h-24 md:w-32 md:h-32 object-contain`}
            style={{
              opacity: 0, // Start invisible and let the animation reveal it
            }}
          />
        )}
        
        {/* "Logo" text */}
        <div 
          ref={logoRef}
          className={`text-5xl md:text-7xl font-bold text-white transition-all duration-1000 ease-out font-[Montserrat]
            ${animationStage === 0 ? 'opacity-0 translate-y-20' : 'opacity-100 translate-y-0'} 
            ${animationStage >= 3 ? (isMobile ? 'translate-y-[15vh]' : 'md:translate-x-[10vw]') : ''}`}
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
