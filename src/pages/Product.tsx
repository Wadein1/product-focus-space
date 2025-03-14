
import React, { useEffect, useState, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const Product = () => {
  const [animationStage, setAnimationStage] = useState(0);
  const isMobile = useIsMobile();
  const yourRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Control the animation sequence with slower timings
  useEffect(() => {
    // Stage 0: Initial stage (words coming in) - takes 1 second
    // Stage 1: Words centered - stays for 0.7 seconds
    // Stage 2: "Your" changes to white (with slower color transition) - takes 0.5 seconds
    // Stage 3: Words separate - takes 0.5 seconds
    // Stage 4: Logo image appears with glitch effect - takes 0.3 seconds
    
    // Initial animation (coming together) - 1 second
    setTimeout(() => setAnimationStage(1), 1000);
    
    // Words stay centered for 0.7 seconds
    setTimeout(() => setAnimationStage(2), 1700); // 1000 + 700
    
    // "Your" changes to white (with slower wipe transition)
    setTimeout(() => setAnimationStage(3), 2200); // 1700 + 500
    
    // Words separate
    setTimeout(() => setAnimationStage(4), 2700); // 2200 + 500
    
    // Logo appears with glitch effect
    setTimeout(() => setAnimationStage(5), 2900); // 2700 + 200 (starts before separation completes)
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        {/* Logo image (initially hidden) */}
        <img 
          ref={imageRef}
          src="/lovable-uploads/05bc8e60-71cb-45b5-899a-2e6d87489436.png"
          alt="Logo"
          className={`absolute w-20 md:w-32 transition-all duration-300 z-20
            ${animationStage >= 5 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
          style={{
            filter: animationStage === 5 ? 'blur(4px) brightness(1.5) contrast(2)' : 'none',
            animation: animationStage === 5 ? 'glitch 0.3s ease-in-out forwards' : 'none'
          }}
        />
        
        {/* "Your" text */}
        <div 
          ref={yourRef}
          className={`text-5xl md:text-7xl font-bold transition-all duration-1000 ease-out font-[Montserrat] z-10
            ${animationStage === 0 ? 'opacity-0 -translate-y-20' : 'opacity-100 translate-y-0'} 
            ${animationStage >= 2 ? 'text-white' : 'text-primary'} 
            ${animationStage >= 3 ? (isMobile ? '-translate-y-[17.5vh]' : 'md:-translate-x-[17.5vw]') : ''}
            ${animationStage >= 5 ? 'opacity-80' : ''}`}
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
          className={`text-5xl md:text-7xl font-bold text-white transition-all duration-1000 ease-out font-[Montserrat]
            ${animationStage === 0 ? 'opacity-0 translate-y-20' : 'opacity-100 translate-y-0'} 
            ${animationStage >= 3 ? (isMobile ? 'translate-y-[17.5vh]' : 'md:translate-x-[17.5vw]') : ''}
            ${animationStage >= 5 ? 'opacity-80' : ''}`}
          style={{
            transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)"
          }}
        >
          Logo
        </div>
      </div>
      
      {/* CSS for the glitch animation */}
      <style jsx>{`
        @keyframes glitch {
          0% {
            clip-path: inset(40% 0 61% 0);
            transform: translate(-20px, 10px);
            opacity: 0.6;
          }
          20% {
            clip-path: inset(92% 0 1% 0);
            transform: translate(20px, -10px);
            opacity: 0.8;
          }
          40% {
            clip-path: inset(43% 0 1% 0);
            transform: translate(-20px, -10px);
            opacity: 0.9;
          }
          60% {
            clip-path: inset(25% 0 58% 0);
            transform: translate(20px, 10px);
            opacity: 0.8;
          }
          80% {
            clip-path: inset(54% 0 7% 0);
            transform: translate(-20px, 10px);
            opacity: 0.9;
          }
          100% {
            clip-path: inset(0% 0 0% 0);
            transform: translate(0, 0);
            opacity: 1;
            filter: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Product;
