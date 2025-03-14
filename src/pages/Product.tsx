
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
    // Stage 3: Words separate and logo appears with glitch - takes 0.5 seconds
    
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
        {/* Logo image with glitch effect - initially hidden */}
        <div 
          className={`absolute z-20 transform transition-all duration-500 
            ${animationStage >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
          `}
          style={{
            width: isMobile ? '30vw' : '20vw',
            maxWidth: '280px',
            filter: animationStage >= 3 ? 'none' : 'blur(10px)',
            transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)"
          }}
        >
          <img 
            ref={logoImageRef}
            src="/lovable-uploads/b1972919-912f-457f-8c0a-885ab631d8c4.png" 
            alt="Logo" 
            className={`w-full h-auto ${animationStage >= 3 ? 'glitch-effect' : ''}`}
          />
        </div>
        
        {/* "Your" text */}
        <div 
          ref={yourRef}
          className={`text-[5.46rem] md:text-[7.65rem] font-bold transition-all duration-1000 ease-out font-[Montserrat] z-10
            ${animationStage === 0 ? 'opacity-0 -translate-y-20' : 'opacity-100 translate-y-0'} 
            ${animationStage >= 2 ? 'text-white' : 'text-primary'} 
            ${animationStage >= 3 ? (isMobile ? '-translate-y-[100%]' : 'md:-translate-x-[110%]') : ''}`}
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
          className={`text-[5.46rem] md:text-[7.65rem] font-bold text-white transition-all duration-1000 ease-out font-[Montserrat]
            ${animationStage === 0 ? 'opacity-0 translate-y-20' : 'opacity-100 translate-y-0'} 
            ${animationStage >= 3 ? (isMobile ? 'translate-y-[100%]' : 'md:translate-x-[110%]') : ''}`}
          style={{
            transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)"
          }}
        >
          Logo
        </div>

        {/* Glitch overlay effect - only visible during transition to stage 3 */}
        <div 
          className={`absolute inset-0 z-30 pointer-events-none glitch-overlay
            ${animationStage === 3 ? 'opacity-100' : 'opacity-0'}`}
          style={{
            transitionDuration: "500ms"
          }}
        ></div>
      </div>

      {/* Add the CSS for the glitch effect */}
      <style jsx>{`
        .glitch-effect {
          position: relative;
        }
        
        .glitch-effect::before,
        .glitch-effect::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: url('/lovable-uploads/b1972919-912f-457f-8c0a-885ab631d8c4.png') no-repeat center center;
          background-size: contain;
          opacity: 0.8;
        }
        
        .glitch-effect::before {
          transform: translate(5px, 0);
          clip-path: polygon(0 10%, 100% 0%, 100% 30%, 0 40%);
          animation: glitch-anim-1 500ms infinite linear alternate-reverse;
        }
        
        .glitch-effect::after {
          transform: translate(-5px, 0);
          clip-path: polygon(0 60%, 100% 70%, 100% 100%, 0 90%);
          animation: glitch-anim-2 650ms infinite linear alternate-reverse;
        }
        
        .glitch-overlay {
          background: linear-gradient(45deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 70%);
          background-size: 200% 200%;
          mix-blend-mode: overlay;
          animation: glitch-overlay 500ms ease-out;
        }
        
        @keyframes glitch-anim-1 {
          0%, 100% { opacity: 0.4; transform: translate(5px, 0) scale(1.01); }
          20%, 80% { opacity: 0.2; transform: translate(4px, 0) scale(0.99); }
          50% { opacity: 0.5; transform: translate(6px, 0) scale(1.02); }
        }
        
        @keyframes glitch-anim-2 {
          0%, 100% { opacity: 0.4; transform: translate(-5px, 0) scale(0.98); }
          20%, 80% { opacity: 0.2; transform: translate(-4px, 0) scale(1.01); }
          50% { opacity: 0.5; transform: translate(-6px, 0) scale(0.97); }
        }
        
        @keyframes glitch-overlay {
          0% { background-position: 200% 0; opacity: 1; }
          100% { background-position: 0% 0; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Product;
