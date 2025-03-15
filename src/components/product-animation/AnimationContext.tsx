
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AnimationContextType {
  animationStage: number;
  startExitAnimation: () => void;
  isExiting: boolean;
}

const AnimationContext = createContext<AnimationContextType>({ 
  animationStage: 0, 
  startExitAnimation: () => {}, 
  isExiting: false 
});

export const useAnimationContext = () => useContext(AnimationContext);

export const AnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [animationStage, setAnimationStage] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  
  // Control the animation sequence with stable timings
  useEffect(() => {
    // Stage 0: Initial stage (words coming in) - takes 1.2 seconds
    // Stage 1: Words centered - stays for 0.7 seconds
    // Stage 2: "Your" changes to white - takes 0.6 seconds
    // Stage 3: Words separate - takes 0.6 seconds
    // Stage 4: Logo transitions to second logo - takes 0.6 seconds
    // Stage 5: Second logo fades in - takes 0.6 seconds and stays until 4.8s
    // Stage 6: Third logo fades in - takes 0.6 seconds
    // Stage 7: Chain logo crashes in - takes 0.6 seconds
    // Stage 8: Chain logo scales down and moves up slightly - after 1.2s delay
    // Stage 9: Button slides in from bottom - starts with stage 8
    
    const timer1 = setTimeout(() => setAnimationStage(1), 1200);
    const timer2 = setTimeout(() => setAnimationStage(2), 1900); // 1200 + 700
    const timer3 = setTimeout(() => setAnimationStage(3), 2500); // 1900 + 600
    const timer4 = setTimeout(() => setAnimationStage(4), 3100); // 2500 + 600
    const timer5 = setTimeout(() => setAnimationStage(5), 3700); // 3100 + 600
    // Hold second logo from 3.7s to 4.8s (1.1s hold time)
    const timer6 = setTimeout(() => setAnimationStage(6), 4800); // 3700 + 1100 (hold time)
    // Add crash zoom animation for the chain logo after the blue logo
    const timer7 = setTimeout(() => setAnimationStage(7), 5400); // 4800 + 600
    // Scale down and move up the chain logo after 1.2s delay
    const timer8 = setTimeout(() => setAnimationStage(8), 6600); // 5400 + 1200
    // Button slides in as the chain logo transforms
    const timer9 = setTimeout(() => setAnimationStage(9), 6650); // 6600 + 50ms delay
    
    // Cleanup timers to prevent memory leaks
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
      clearTimeout(timer7);
      clearTimeout(timer8);
      clearTimeout(timer9);
    };
  }, []);

  const startExitAnimation = () => {
    setIsExiting(true);
  };

  return (
    <AnimationContext.Provider value={{ animationStage, startExitAnimation, isExiting }}>
      {children}
    </AnimationContext.Provider>
  );
};
