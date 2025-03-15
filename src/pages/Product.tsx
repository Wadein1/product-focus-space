
import React, { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const Product = () => {
  const [animationStage, setAnimationStage] = useState(0);
  const isMobile = useIsMobile();
  
  // Control the animation sequence with stable timings
  useEffect(() => {
    // Stage 0: Initial stage (words coming in) - takes 1.2 seconds
    // Stage 1: Words centered - stays for 0.7 seconds
    // Stage 2: "Your" changes to white - takes 0.6 seconds
    // Stage 3: Words separate - takes 0.6 seconds
    // Stage 4: Logo transitions to second logo - takes 0.6 seconds
    // Stage 5: Second logo fades in - takes 0.6 seconds and stays until 4.8s
    // Stage 6: Third logo fades in - takes 0.6 seconds
    
    const timer1 = setTimeout(() => setAnimationStage(1), 1200);
    const timer2 = setTimeout(() => setAnimationStage(2), 1900); // 1200 + 700
    const timer3 = setTimeout(() => setAnimationStage(3), 2500); // 1900 + 600
    const timer4 = setTimeout(() => setAnimationStage(4), 3100); // 2500 + 600
    const timer5 = setTimeout(() => setAnimationStage(5), 3700); // 3100 + 600
    // Hold second logo from 3.7s to 4.8s (1.1s hold time)
    const timer6 = setTimeout(() => setAnimationStage(6), 4800); // 3700 + 1100 (hold time)
    
    // Cleanup timers to prevent memory leaks
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
    };
  }, []);

  // Calculate movement distance based on screen size
  const getTransformValue = () => {
    if (isMobile) {
      return "translateY(-100px)";
    }
    return "translateX(-200%)"; // Increased from -100% to -200% for web version
  };

  const getLowerTransformValue = () => {
    if (isMobile) {
      return "translateY(100px)";
    }
    return "translateX(200%)"; // Increased from 100% to 200% for web version
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        {/* First Logo image */}
        <div 
          className={`absolute z-20 transition-all duration-500 ${
            animationStage >= 3 && animationStage < 5 ? 'opacity-100' : 'opacity-0'
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

        {/* Second Logo image with slide-in effect */}
        <div 
          className={`absolute z-20 transition-all duration-500 ${
            animationStage >= 5 && animationStage < 6 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
          style={{
            transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
            transform: 'translate(-50%, -50%)',
            left: '50%',
            top: '50%'
          }}
        >
          <img 
            src="/lovable-uploads/0714db33-c114-424b-97d9-9d52f0946db7.png" 
            alt="Spartan Logo" 
            className={`w-32 md:w-48 ${animationStage === 5 ? 'animate-glitch' : ''}`}
          />
        </div>
        
        {/* Third Logo image with slide-in effect */}
        <div 
          className={`absolute z-20 transition-all duration-500 ${
            animationStage >= 6 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
          style={{
            transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
            transform: 'translate(-50%, -50%)',
            left: '50%',
            top: '50%'
          }}
        >
          <img 
            src="/lovable-uploads/18f78706-7039-417a-bf70-837045f5e1de.png" 
            alt="Blue Logo" 
            className={`w-32 md:w-48 ${animationStage === 6 ? 'animate-glitch' : ''}`}
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
                ? 'translateY(-95px)' 
                : animationStage >= 3 
                  ? getTransformValue() 
                  : 'translateY(-35px)', // Added more separation here
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
                ? 'translateY(95px)' 
                : animationStage >= 3 
                  ? getLowerTransformValue() 
                  : 'translateY(35px)', // Added more separation here
              transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)"
            }}
          >
            Logo
          </div>
        </div>
      </div>

      {/* CSS for the glitch animations */}
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
