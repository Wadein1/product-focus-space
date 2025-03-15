
import React from 'react';
import { useAnimationContext } from './AnimationContext';
import { useTransformValues } from './TransformUtils';

export const AnimatedText: React.FC = () => {
  const { animationStage } = useAnimationContext();
  const { getUpperTransformValue, getLowerTransformValue } = useTransformValues();

  return (
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
              ? getUpperTransformValue() 
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
  );
};
