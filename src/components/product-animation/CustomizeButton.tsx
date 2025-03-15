
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAnimationContext } from './AnimationContext';
import { useTransformValues } from './TransformUtils';
import { useNavigate } from 'react-router-dom';

export const CustomizeButton: React.FC = () => {
  const {
    animationStage,
    startExitAnimation
  } = useAnimationContext();
  const {
    isMobile
  } = useTransformValues();
  const navigate = useNavigate();

  // Button click handler to navigate to the product customization page with animation
  const handleCustomizeClick = () => {
    console.log("Customize button clicked");
    // Start the exit animation
    startExitAnimation();
    
    // Navigate after animation completes
    setTimeout(() => {
      navigate("/customize");
    }, 800); // Match this with animation duration
  };

  return (
    <div 
      className={`absolute z-40 transition-all duration-800 ease-out ${animationStage >= 9 ? 'opacity-100' : 'opacity-0'}`} 
      style={{
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1.6)',
        bottom: isMobile ? '-125px' : '-275px', // Moved up 225px from previous position (-350px and -500px)
        left: '50%',
        transform: animationStage >= 9 ? 'translate(-50%, 0)' : 'translate(-50%, 100px)',
        width: 'fit-content'
      }}
    >
      <Button 
        onClick={handleCustomizeClick} 
        className="bg-primary hover:bg-primary/90 text-white font-bold shadow-lg text-lg text-center px-6 py-6 md:px-[43px] md:py-[27px] rounded-2xl"
      >
        Customize Now <ArrowRight className="ml-2" />
      </Button>
    </div>
  );
};
