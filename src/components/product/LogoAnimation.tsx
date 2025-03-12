
import React, { useEffect, useState } from 'react';
import './animations.css';

export const LogoAnimation = () => {
  const [animate, setAnimate] = useState(false);
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    // Start animation after component mounts
    setAnimate(true);
    
    // After initial animation, begin separation and then show the logo
    const separationTimer = setTimeout(() => {
      setShowLogo(true);
    }, 1200); // Delay showing logo to allow text to start moving first
    
    return () => clearTimeout(separationTimer);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black overflow-hidden">
      <div className={`logo-animation-container ${animate ? 'animate' : ''} ${showLogo ? 'separate' : ''}`}>
        <span className="text-6xl md:text-8xl font-bold your-text font-montserrat">
          Your
        </span>
        
        {showLogo && (
          <div className="logo-image-container">
            <img 
              src="/lovable-uploads/2bd49f1c-637b-40bf-813e-27e6a5bd4066.png" 
              alt="Logo" 
              className="w-40 h-40 md:w-52 md:h-52 logo-image"
            />
          </div>
        )}
        
        <span className="text-6xl md:text-8xl font-bold logo-text text-white font-montserrat">
          Logo
        </span>
      </div>
    </div>
  );
};
