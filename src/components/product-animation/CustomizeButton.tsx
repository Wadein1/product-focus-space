
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAnimationContext } from './AnimationContext';
import { useTransformValues } from './TransformUtils';

export const CustomizeButton: React.FC = () => {
  const {
    animationStage
  } = useAnimationContext();
  const {
    isMobile
  } = useTransformValues();

  // Button click handler (placeholder for now)
  const handleCustomizeClick = () => {
    console.log("Customize button clicked");
  };
  
  return <div className={`absolute z-40 transition-all duration-800 ease-out ${animationStage >= 9 ? 'opacity-100' : 'opacity-0'}`} style={{
    transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1.6)',
    // Moved down significantly to be well below the chain image
    bottom: isMobile ? '-100px' : '-200px',
    // Center-aligned properly using transform
    left: '50%',
    transform: animationStage >= 9 
      ? 'translate(-50%, 0)' 
      : 'translate(-50%, 100px)',
    width: 'fit-content'
  }}>
      <Button onClick={handleCustomizeClick} className="bg-primary hover:bg-primary/90 text-white font-bold rounded-full shadow-lg py-[32px] px-[37px] text-lg text-center">
        Customize Now <ArrowRight className="ml-2" />
      </Button>
    </div>;
};
