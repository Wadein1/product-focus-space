
import React, { useEffect, useState } from 'react';
import './animations.css';

export const LogoAnimation = () => {
  const [animate, setAnimate] = useState(false);
  const [textSeparation, setTextSeparation] = useState(false);

  useEffect(() => {
    // Start initial animation after component mounts
    setAnimate(true);
    
    // After initial animation completes, wait for 0.6 seconds before starting separation
    const separationTimer = setTimeout(() => {
      setTextSeparation(true);
    }, 1400); // 800ms for initial animation + 600ms pause
    
    return () => clearTimeout(separationTimer);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black overflow-hidden">
      <div className={`logo-animation-container ${animate ? 'animate' : ''} ${textSeparation ? 'separate' : ''}`}>
        <span className="text-6xl md:text-8xl font-bold your-text font-montserrat">
          Your
        </span>
        
        <span className="text-6xl md:text-8xl font-bold logo-text text-white font-montserrat">
          Logo
        </span>
      </div>
    </div>
  );
};
