
import React, { useState } from 'react';
import { AnimationProvider } from './AnimationContext';
import { AnimationStyles } from './AnimationStyles';
import { AnimatedText } from './AnimatedText';
import { LogoSequence } from './LogoSequence';
import { ChainLogo } from './ChainLogo';
import { CustomizeButton } from './CustomizeButton';

export const ProductAnimation: React.FC = () => {
  return (
    <AnimationProvider>
      <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
        <div className="relative flex flex-col items-center justify-center w-full h-full">
          <LogoSequence />
          <ChainLogo />
          <CustomizeButton />
          <AnimatedText />
        </div>
        <AnimationStyles />
      </div>
    </AnimationProvider>
  );
};
