
import React, { useEffect, useState, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

// Define keyframes for the glitch effect in CSS
const glitchKeyframes = `
  0% {
    clip-path: inset(40% 0 61% 0);
    transform: translate(-20px, -10px);
    opacity: 0;
  }
  20% {
    clip-path: inset(92% 0 1% 0);
    transform: translate(20px, 10px);
    opacity: 0.3;
  }
  40% {
    clip-path: inset(43% 0 1% 0);
    transform: translate(-20px, -10px);
    opacity: 0.6;
  }
  60% {
    clip-path: inset(25% 0 58% 0);
    transform: translate(20px, 10px);
    opacity: 0.8;
  }
  80% {
    clip-path: inset(54% 0 7% 0);
    transform: translate(-20px, -10px);
    opacity: 0.9;
  }
  100% {
    clip-path: inset(0 0 0 0);
    transform: translate(0, 0);
    opacity: 1;
  }
`;

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
    // Stage 4: Logo appears with glitch effect - takes 0.5 seconds
    
    // Initial animation (coming together) - 1 second
    setTimeout(() => setAnimationStage(1), 1000);
    
    // Words stay centered for 0.7 seconds
    setTimeout(() => setAnimationStage(2), 1700); // 1000 + 700
    
    // "Your" changes to white (with slower wipe transition)
    setTimeout(() => setAnimationStage(3), 2200); // 1700 + 500
    
    // Words separate and logo appears with glitch effect
    setTimeout(() => setAnimationStage(4), 2700); // 2200 + 500
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        {/* Logo image (initially hidden) */}
        <img
          ref={logoImageRef}
          src="/lovable-uploads/5060b155-7612-4407-b913-2be9e1110973.png"
          alt="Logo"
          className={`absolute z-20 w-32 h-32 md:w-48 md:h-48 transition-all duration-500
            ${animationStage >= 4 ? 'opacity-100' : 'opacity-0'}`}
          style={{
            animation: animationStage >= 4 ? `glitch 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards` : 'none'
          }}
        />
        
        {/* "Your" text */}
        <div 
          ref={yourRef}
          className={`absolute text-5xl md:text-7xl font-bold transition-all duration-1000 ease-out font-[Montserrat] z-10
            ${animationStage === 0 ? 'opacity-0 -translate-y-20' : 'opacity-100 translate-y-0'} 
            ${animationStage >= 2 ? 'text-white' : 'text-primary'} 
            ${animationStage >= 3 ? (isMobile ? '-translate-y-[17.5vh]' : 'md:-translate-x-[17.5vw]') : ''}`}
          style={{
            transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)",
            transitionDuration: animationStage === 2 ? "500ms" : "1000ms" // Slower color transition
          }}
        >
          Your
        </div>
        
        {/* "Logo" text */}
        <div 
          ref={logoRef}
          className={`absolute text-5xl md:text-7xl font-bold text-white transition-all duration-1000 ease-out font-[Montserrat]
            ${animationStage === 0 ? 'opacity-0 translate-y-20' : 'opacity-100 translate-y-0'} 
            ${animationStage >= 3 ? (isMobile ? 'translate-y-[17.5vh]' : 'md:translate-x-[17.5vw]') : ''}`}
          style={{
            transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)"
          }}
        >
          Logo
        </div>
      </div>

      {/* Add the glitch animation keyframes */}
      <style>
        {`
          @keyframes glitch {
            ${glitchKeyframes}
          }
        `}
      </style>
    </div>
  );
};

export default Product;
