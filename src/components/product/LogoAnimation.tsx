
import React, { useEffect, useState } from 'react';
import './animations.css';

export const LogoAnimation = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Start animation after component mounts
    setAnimate(true);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white overflow-hidden">
      <div className={`logo-animation-container ${animate ? 'animate' : ''}`}>
        <span className="text-6xl md:text-8xl font-bold your-text">
          Your
        </span>
        <span className="text-6xl md:text-8xl font-bold logo-text">
          Logo
        </span>
      </div>
    </div>
  );
};
