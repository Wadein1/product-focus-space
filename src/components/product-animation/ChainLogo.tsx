
import React from 'react';
import { useAnimationContext } from './AnimationContext';
import { useTransformValues } from './TransformUtils';

export const ChainLogo: React.FC = () => {
  const { animationStage } = useAnimationContext();
  const { isMobile } = useTransformValues();

  return (
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
  );
};
