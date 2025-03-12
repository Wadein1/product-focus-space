
import React, { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface AnimatedTextProps {
  onAnimationComplete: () => void;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({ onAnimationComplete }) => {
  const [animationState, setAnimationState] = useState("initial");
  const isMobile = useIsMobile();

  useEffect(() => {
    // Start animation sequence
    const initialTimeout = setTimeout(() => {
      setAnimationState("centered");
      
      // After words are centered, pause for 0.2 seconds
      const pauseTimeout = setTimeout(() => {
        setAnimationState("separating");
        
        // After separation animation completes
        const completeTimeout = setTimeout(() => {
          onAnimationComplete();
        }, 800);
        
        return () => clearTimeout(completeTimeout);
      }, 200);
      
      return () => clearTimeout(pauseTimeout);
    }, 800); // Initial centering animation
    
    return () => clearTimeout(initialTimeout);
  }, [onAnimationComplete]);

  return (
    <div className="h-screen w-full flex items-center justify-center overflow-hidden">
      <div className={`text-animation ${animationState}`}>
        <div className="your">Your</div>
        <div className="logo">Logo</div>
      </div>
      
      <style>
        {`
        .text-animation {
          display: flex;
          flex-direction: ${isMobile ? 'column' : 'row'};
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          font-weight: bold;
          font-size: ${isMobile ? '2.5rem' : '4rem'};
          width: 100%;
          height: 100%;
        }
        
        .your {
          color: #0ca2ed;
          transform: translateY(${isMobile ? '-100vh' : '-50vh'});
          opacity: 0;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease;
        }
        
        .logo {
          color: white;
          transform: translateY(${isMobile ? '100vh' : '50vh'});
          opacity: 0;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease;
          margin-left: ${isMobile ? '0' : '12px'};
          margin-top: ${isMobile ? '12px' : '0'};
        }
        
        .centered .your,
        .centered .logo {
          transform: translateY(0);
          opacity: 1;
        }
        
        .separating .your {
          transform: ${isMobile 
            ? 'translateY(calc(-40vh + 2.5rem))' 
            : 'translateX(calc(-15vw))'};
        }
        
        .separating .logo {
          transform: ${isMobile 
            ? 'translateY(calc(40vh - 2.5rem))' 
            : 'translateX(calc(15vw))'};
        }
        `}
      </style>
    </div>
  );
};
