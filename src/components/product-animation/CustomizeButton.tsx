
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAnimationContext } from './AnimationContext';
import { useTransformValues } from './TransformUtils';

export const CustomizeButton: React.FC = () => {
  const { animationStage } = useAnimationContext();
  const { isMobile } = useTransformValues();
  
  // Button click handler (placeholder for now)
  const handleCustomizeClick = () => {
    console.log("Customize button clicked");
  };

  return (
    <div 
      className={`absolute z-40 transition-all duration-800 ease-out ${
        animationStage >= 9 ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1.6)',
        transform: animationStage >= 9 ? 'translateY(0)' : 'translateY(100px)',
        bottom: isMobile ? '10%' : '15%',
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
  );
};
