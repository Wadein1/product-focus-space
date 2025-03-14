
import React, { useEffect, useState, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const Product = () => {
  const [animationStage, setAnimationStage] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const isMobile = useIsMobile();
  const yourRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  
  // Listen for window resize events to update viewport width
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Calculate responsive font size based on viewport width
  const getResponsiveFontSize = (baseSize: number) => {
    const minWidth = 320; // Smallest mobile viewport
    const maxWidth = 1920; // Large desktop
    const scaleFactor = Math.min(Math.max(viewportWidth / maxWidth, 0.7), 1);
    return `${baseSize * scaleFactor}rem`;
  };
  
  // Calculate responsive translation distance
  const getTranslationDistance = (isMobile: boolean) => {
    const baseTranslationMobile = 100; // Base percentage for mobile
    const baseTranslationWeb = 110; // Base percentage for web
    
    const minWidth = isMobile ? 320 : 768;
    const maxWidth = isMobile ? 767 : 1920;
    const currentWidth = Math.min(Math.max(viewportWidth, minWidth), maxWidth);
    
    // Calculate a scale factor between 0.8 and 1.2 based on viewport size
    const scaleFactor = isMobile 
      ? 0.8 + (0.4 * (currentWidth - minWidth) / (maxWidth - minWidth))
      : 0.8 + (0.4 * (currentWidth - minWidth) / (maxWidth - minWidth));
    
    const baseTranslation = isMobile ? baseTranslationMobile : baseTranslationWeb;
    return `${baseTranslation * scaleFactor}%`;
  };
  
  // Control the animation sequence with slower timings
  useEffect(() => {
    // Stage 0: Initial stage (words coming in) - takes 1 second
    // Stage 1: Words centered - stays for 0.7 seconds
    // Stage 2: "Your" changes to white (with slower color transition) - takes 0.5 seconds
    // Stage 3: Words separate - takes 0.5 seconds
    
    // Initial animation (coming together) - 1 second
    setTimeout(() => setAnimationStage(1), 1000);
    
    // Words stay centered for 0.7 seconds
    setTimeout(() => setAnimationStage(2), 1700); // 1000 + 700
    
    // "Your" changes to white (with slower wipe transition)
    setTimeout(() => setAnimationStage(3), 2200); // 1700 + 500
    
    // Words separate
    setTimeout(() => setAnimationStage(4), 2700); // 2200 + 500
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        {/* "Your" text */}
        <div 
          ref={yourRef}
          className={`font-bold transition-all duration-1000 ease-out font-[Montserrat] z-10
            ${animationStage === 0 ? 'opacity-0 -translate-y-20' : 'opacity-100 translate-y-0'} 
            ${animationStage >= 2 ? 'text-white' : 'text-primary'} 
            ${animationStage >= 3 ? (isMobile ? '-translate-y-' : 'md:-translate-x-') + getTranslationDistance(isMobile) : ''}`}
          style={{
            fontSize: isMobile ? getResponsiveFontSize(5.46) : getResponsiveFontSize(7.65),
            transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)",
            transitionDuration: animationStage === 2 ? "500ms" : "1000ms" // Slower color transition
          }}
        >
          Your
        </div>
        
        {/* "Logo" text */}
        <div 
          ref={logoRef}
          className={`font-bold text-white transition-all duration-1000 ease-out font-[Montserrat]
            ${animationStage === 0 ? 'opacity-0 translate-y-20' : 'opacity-100 translate-y-0'} 
            ${animationStage >= 3 ? (isMobile ? 'translate-y-' : 'md:translate-x-') + getTranslationDistance(isMobile) : ''}`}
          style={{
            fontSize: isMobile ? getResponsiveFontSize(5.46) : getResponsiveFontSize(7.65),
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
