
import React, { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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
    // Stage 7: Chain logo crashes in - takes 0.6 seconds
    // Stage 8: Chain logo scales down and moves up slightly - after 1.2s delay
    // Stage 9: Button slides in from bottom - starts with stage 8
    
    const timer1 = setTimeout(() => setAnimationStage(1), 1200);
    const timer2 = setTimeout(() => setAnimationStage(2), 1900); // 1200 + 700
    const timer3 = setTimeout(() => setAnimationStage(3), 2500); // 1900 + 600
    const timer4 = setTimeout(() => setAnimationStage(4), 3100); // 2500 + 600
    const timer5 = setTimeout(() => setAnimationStage(5), 3700); // 3100 + 600
    // Hold second logo from 3.7s to 4.8s (1.1s hold time)
    const timer6 = setTimeout(() => setAnimationStage(6), 4800); // 3700 + 1100 (hold time)
    // Add crash zoom animation for the chain logo after the blue logo
    const timer7 = setTimeout(() => setAnimationStage(7), 5400); // 4800 + 600
    // Scale down and move up the chain logo after 1.2s delay
    const timer8 = setTimeout(() => setAnimationStage(8), 6600); // 5400 + 1200
    // Button slides in as the chain logo transforms
    const timer9 = setTimeout(() => setAnimationStage(9), 6650); // 6600 + 50ms delay
    
    // Cleanup timers to prevent memory leaks
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
      clearTimeout(timer7);
      clearTimeout(timer8);
      clearTimeout(timer9);
    };
  }, []);

  // Calculate movement distance based on screen size
  const getTransformValue = () => {
    if (isMobile) {
      return "translateY(-100px)";
    }
    return "translateX(-120%)"; // Changed from -200% to -120% for web version
  };

  const getLowerTransformValue = () => {
    if (isMobile) {
      return "translateY(100px)";
    }
    return "translateX(120%)"; // Changed from 200% to 120% for web version
  };

  // Button click handler (placeholder for now)
  const handleCustomizeClick = () => {
    console.log("Customize button clicked");
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        {/* First Logo image */}
        <div 
          className={`absolute z-20 transition-all duration-500 ${
            animationStage >= 3 && animationStage < 5 ? 'opacity-100' : 'opacity-0'
          } ${animationStage >= 7 ? 'push-out' : ''}`}
          style={{
            transition: 'opacity 0.5s ease-out, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1.6)',
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
          } ${animationStage >= 7 ? 'push-out' : ''}`}
          style={{
            transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1.6)',
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
            animationStage >= 6 && animationStage < 7 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          } ${animationStage >= 7 ? 'push-out' : ''}`}
          style={{
            transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1.6)',
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
        
        {/* Chain Logo with push-zoom effect - 50% bigger */}
        <div 
          className={`absolute z-30 transition-all duration-700 ${
            animationStage >= 7 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          }`}
          style={{
            transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1.6)',
            transform: `translate(-50%, -50%) ${animationStage >= 8 ? 'translateY(-40px) scale(0.9)' : ''}`,
            left: '50%',
            top: '50%',
            width: isMobile ? '120vw' : 'auto',
            maxWidth: isMobile ? '120%' : 'none'
          }}
        >
          <img 
            src="/lovable-uploads/0a05a66e-e97e-4a5a-a5f2-8156112f7765.png" 
            alt="Chain Logo" 
            className={`w-full md:w-[240rem] ${animationStage === 7 ? 'animate-push-zoom' : ''}`}
          />
        </div>
        
        {/* Customize Now Button */}
        <div 
          className={`absolute z-40 transition-all duration-800 ease-out ${
            animationStage >= 9 ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1.6)',
            transform: animationStage >= 9 ? 'translateY(0)' : 'translateY(100px)',
            bottom: isMobile ? '10%' : '5%',
            left: '50%',
            marginLeft: '-100px',
          }}
        >
          <Button 
            onClick={handleCustomizeClick}
            className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg"
          >
            Customize Now <ArrowRight className="ml-2" />
          </Button>
        </div>
        
        {/* Words container - gives a stable reference point */}
        <div className={`relative h-32 md:h-40 flex items-center justify-center transition-opacity duration-300 ${animationStage >= 7 ? 'opacity-0' : 'opacity-100'}`}>
          {/* "Your" text */}
          <div 
            className={`absolute text-5xl md:text-7xl font-bold transition-all duration-1000 font-[Montserrat] z-10
              ${animationStage === 0 ? 'opacity-0' : 'opacity-100'} 
              ${animationStage >= 2 ? 'text-white' : 'text-primary'}
              ${animationStage >= 7 ? 'push-out-top' : ''}`}
            style={{
              transform: animationStage === 0 
                ? 'translateY(-95px)' 
                : animationStage >= 3 
                  ? getTransformValue() 
                  : 'translateY(-35px)',
              transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)",
              transitionDuration: animationStage === 2 ? "500ms" : "1000ms"
            }}
          >
            Your
          </div>
          
          {/* "Logo" text */}
          <div 
            className={`absolute text-5xl md:text-7xl font-bold text-white transition-all duration-1000 font-[Montserrat]
              ${animationStage === 0 ? 'opacity-0' : 'opacity-100'}
              ${animationStage >= 7 ? 'push-out-bottom' : ''}`}
            style={{
              transform: animationStage === 0 
                ? 'translateY(95px)' 
                : animationStage >= 3 
                  ? getLowerTransformValue() 
                  : 'translateY(35px)',
              transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)"
            }}
          >
            Logo
          </div>
        </div>
      </div>

      {/* CSS for the animations */}
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
          
          @keyframes push-zoom {
            0% {
              transform: scale(0.1);
              opacity: 0;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          
          .animate-push-zoom {
            animation: push-zoom 0.7s cubic-bezier(0.16, 1, 0.3, 1.6) forwards;
          }
          
          .push-out {
            transform: translate(200%, 200%) scale(0.5) !important;
            opacity: 0 !important;
            transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1.6) !important;
          }
          
          .push-out-top {
            transform: translate(-200%, -300%) scale(0.5) !important;
            opacity: 0 !important;
            transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1.6) !important;
          }
          
          .push-out-bottom {
            transform: translate(200%, 300%) scale(0.5) !important;
            opacity: 0 !important;
            transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1.6) !important;
          }

          .ease-out {
            transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1.6);
          }
        `}
      </style>
    </div>
  );
};

export default Product;
