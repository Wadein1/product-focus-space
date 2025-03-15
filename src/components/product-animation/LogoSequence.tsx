
import React from 'react';
import { useAnimationContext } from './AnimationContext';

export const LogoSequence: React.FC = () => {
  const { animationStage } = useAnimationContext();

  return (
    <>
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
    </>
  );
};
