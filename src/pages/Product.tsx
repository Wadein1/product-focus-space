
import React, { useEffect, useState, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const Product = () => {
  const [animationStage, setAnimationStage] = useState(0);
  const [showSecondLogo, setShowSecondLogo] = useState(false);
  const [showThirdLogo, setShowThirdLogo] = useState(false);
  const isMobile = useIsMobile();
  const yourRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const logoImageRef = useRef<HTMLImageElement>(null);
  const secondLogoImageRef = useRef<HTMLImageElement>(null);
  const thirdLogoImageRef = useRef<HTMLImageElement>(null);
  
  // Control the animation sequence with slower timings
  useEffect(() => {
    // Stage 0: Initial stage (words coming in) - takes 1 second
    // Stage 1: Words centered - stays for 0.7 seconds
    // Stage 2: "Your" changes to white (with slower color transition) - takes 0.5 seconds
    // Stage 3: Words separate - takes 0.5 seconds
    // Stage 4: First logo glitches - takes 0.5 seconds
    // Stage 5: Logo transition to second logo - takes 0.7 seconds
    // Stage 6: Second logo to third logo transition - takes 0.7 seconds
    
    // Initial animation (coming together) - 1 second
    setTimeout(() => setAnimationStage(1), 1000);
    
    // Words stay centered for 0.7 seconds
    setTimeout(() => setAnimationStage(2), 1700); // 1000 + 700
    
    // "Your" changes to white (with slower wipe transition)
    setTimeout(() => setAnimationStage(3), 2200); // 1700 + 500
    
    // Words separate
    setTimeout(() => setAnimationStage(4), 2700); // 2200 + 500
    
    // Start logo swipe transition to second logo
    setTimeout(() => {
      setShowSecondLogo(true);
    }, 3200); // 2700 + 500
    
    // Start logo swipe transition to third logo
    setTimeout(() => {
      setShowThirdLogo(true);
    }, 4000); // 3200 + 800
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        {/* Logo container - absolute positioning with transform to ensure consistent positioning */}
        <div 
          className={`absolute z-20 left-1/2 -translate-x-1/2 transition-all duration-500 ${
            animationStage >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
          style={{
            filter: animationStage >= 3 ? 'none' : 'blur(10px)',
            transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}
        >
          {/* First logo */}
          <img 
            ref={logoImageRef}
            src="/lovable-uploads/e4668e58-44af-46a9-9887-8dac7f9ac75c.png" 
            alt="Logo" 
            className={`w-32 md:w-48 transition-all duration-700 ${
              animationStage === 3 ? 'animate-glitch' : ''
            } ${showSecondLogo ? 'opacity-0 -translate-x-full blur-sm' : 'opacity-100'}`}
            style={{
              transition: showSecondLogo ? 'all 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}
          />
          
          {/* Second logo that appears with swipe fade transition */}
          <img 
            ref={secondLogoImageRef}
            src="/lovable-uploads/f923f914-68d3-46aa-9928-585445452189.png" 
            alt="Second Logo" 
            className={`w-32 md:w-48 transition-all duration-700 ${
              showSecondLogo && !showThirdLogo ? 'opacity-100 translate-x-0 animate-glitch' : 
              showSecondLogo && showThirdLogo ? 'opacity-0 -translate-x-full blur-sm' : 
              'opacity-0 translate-x-full blur-sm'
            }`}
            style={{
              transition: 'all 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}
          />
          
          {/* Third logo that appears with swipe fade transition - bigger size */}
          <img 
            ref={thirdLogoImageRef}
            src="/lovable-uploads/ce3838a6-2d2a-4686-a9b2-13db346e7b3f.png" 
            alt="Third Logo" 
            className={`w-[120px] md:w-[180px] transition-all duration-700 ${
              showThirdLogo ? 'opacity-100 translate-x-0 animate-glitch' : 'opacity-0 translate-x-full blur-sm'
            }`}
            style={{
              transition: 'all 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}
          />
        </div>
        
        {/* Text container to ensure consistent positioning */}
        <div className="relative flex flex-col items-center justify-center">
          {/* "Your" text - using fixed values for transform to ensure consistent movement */}
          <div 
            ref={yourRef}
            className={`text-5xl md:text-7xl font-bold transition-all duration-1000 ease-out font-[Montserrat] z-10 absolute
              ${animationStage === 0 ? 'opacity-0 -translate-y-20' : 'opacity-100 translate-y-0'} 
              ${animationStage >= 2 ? 'text-white' : 'text-primary'}`}
            style={{
              transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)",
              transitionDuration: animationStage === 2 ? "500ms" : "1000ms", // Slower color transition
              transform: animationStage >= 3 ? (isMobile ? 'translateY(-150px)' : 'translateY(-150px)') : 'translateY(0)'
            }}
          >
            Your
          </div>
          
          {/* "Logo" text - using fixed values for transform to ensure consistent movement */}
          <div 
            ref={logoRef}
            className={`text-5xl md:text-7xl font-bold text-white transition-all duration-1000 ease-out font-[Montserrat] absolute`}
            style={{
              transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)",
              opacity: animationStage === 0 ? 0 : 1,
              transform: animationStage === 0 
                ? 'translateY(20px)'
                : animationStage >= 3 
                  ? (isMobile ? 'translateY(150px)' : 'translateY(150px)') 
                  : 'translateY(0)'
            }}
          >
            Logo
          </div>
        </div>
      </div>

      {/* CSS for the glitch animation */}
      <style>
        {`
          @keyframes glitch {
            0% {
              transform: translate(0);
              filter: brightness(1);
            }
            20% {
              transform: translate(-5px, 5px);
              filter: brightness(1.1);
            }
            40% {
              transform: translate(-5px, -5px);
              filter: brightness(0.9);
            }
            60% {
              transform: translate(5px, 5px) skewX(5deg);
              filter: brightness(1.2) contrast(1.1);
            }
            80% {
              transform: translate(5px, -5px);
              filter: brightness(0.9) contrast(1.2);
            }
            100% {
              transform: translate(0);
              filter: brightness(1);
            }
          }
          
          .animate-glitch {
            animation: glitch 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
          }
        `}
      </style>
    </div>
  );
};

export default Product;
