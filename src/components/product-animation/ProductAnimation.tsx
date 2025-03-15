
import React from 'react';
import { AnimationProvider } from './AnimationContext';
import { AnimationStyles } from './AnimationStyles';
import { AnimatedText } from './AnimatedText';
import { LogoSequence } from './LogoSequence';
import { ChainLogo } from './ChainLogo';
import { CustomizeButton } from './CustomizeButton';
import { useAnimationContext } from './AnimationContext';

const AnimationContent = () => {
  const { isExiting } = useAnimationContext();
  
  return (
    <div className={`relative flex flex-col items-center justify-center w-full h-full transition-all duration-800 ease-out ${isExiting ? 'translate-x-[-100%] opacity-0' : ''}`}>
      <LogoSequence />
      <ChainLogo />
      <CustomizeButton />
      <AnimatedText />
    </div>
  );
};

export const ProductAnimation: React.FC = () => {
  return (
    <AnimationProvider>
      <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
        <AnimationContent />
        <AnimationStyles />
      </div>
    </AnimationProvider>
  );
};
