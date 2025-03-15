
import React, { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const Product = () => {
  const [animationStage, setAnimationStage] = useState(0);
  const isMobile = useIsMobile();
  
  // Control the animation sequence with stable timings
  useEffect(() => {
    // Stage 0: Initial stage (words coming in) - takes 1 second
    // Stage 1: Words centered - stays for 0.7 seconds
    // Stage 2: "Your" changes to white - takes 0.5 seconds
    // Stage 3: Words separate - takes 0.5 seconds
    
    const timer1 = setTimeout(() => setAnimationStage(1), 1000);
    const timer2 = setTimeout(() => setAnimationStage(2), 1700); // 1000 + 700
    const timer3 = setTimeout(() => setAnimationStage(3), 2200); // 1700 + 500
    const timer4 = setTimeout(() => setAnimationStage(4), 2700); // 2200 + 500
    
    // Cleanup timers to prevent memory leaks
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  // Calculate movement distance based on screen size
  const getTransformValue = () => {
    if (isMobile) {
      return "translateY(-100px)";
    }
    return "translateX(-100%)";
  };

  const getLowerTransformValue = () => {
    if (isMobile) {
      return "translateY(100px)";
    }
    return "translateX(100%)";
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        {/* Logo image with more universal animation */}
        <div 
          className={`absolute z-20 ${
            animationStage >= 3 ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            transition: 'opacity 0.5s ease-out',
            transform: 'translate(-50%, -50%)',
            left: '50%',
            top: '50%'
          }}
        >
          <img 
            src="/lovable-uploads/e4668e58-44af-46a9-9887-8dac7f9ac75c.png" 
            alt="Logo" 
            className={`w-32 md:w-48 ${animationStage === 3 ? 'animate-glitch' : ''}`}
          />
        </div>
        
        {/* Words container - gives a stable reference point */}
        <div className="relative h-32 md:h-40 flex items-center justify-center">
          {/* "Your" text */}
          <div 
            className={`absolute text-5xl md:text-7xl font-bold transition-all duration-1000 font-[Montserrat] z-10
              ${animationStage === 0 ? 'opacity-0' : 'opacity-100'} 
              ${animationStage >= 2 ? 'text-white' : 'text-primary'}`}
            style={{
              transform: animationStage === 0 
                ? 'translateY(-1000px)' 
                : animationStage >= 3 
                  ? getTransformValue() 
                  : 'translateY(-15px)',
              transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)",
              transitionDuration: animationStage === 2 ? "500ms" : "1000ms"
            }}
          >
            Your
          </div>
          
          {/* "Logo" text */}
          <div 
            className={`absolute text-5xl md:text-7xl font-bold text-white transition-all duration-1000 font-[Montserrat]
              ${animationStage === 0 ? 'opacity-0' : 'opacity-100'}`}
            style={{
              transform: animationStage === 0 
                ? 'translateY(1000px)' 
                : animationStage >= 3 
                  ? getLowerTransformValue() 
                  : 'translateY(15px)',
              transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)"
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
