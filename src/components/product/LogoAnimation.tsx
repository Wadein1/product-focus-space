
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import './animations.css';

// Local fallback images in case the uploads aren't available
const LOGO_FALLBACKS = [
  '/placeholder.svg',
  '/placeholder.svg',
  '/placeholder.svg',
  '/placeholder.svg'
];

// Logo paths - ensuring they match the available files
const LOGOS = [
  '/lovable-uploads/076015c7-e9ad-43f0-a29f-c9a923ffc91b.png', // TH Logo
  '/lovable-uploads/105f7156-5cbc-4e97-ac1b-1eb94ec19e91.png', // BC Logo
  '/lovable-uploads/12631842-f4a2-49fc-af99-15b2492366e0.png', // Bulldog Logo
  '/lovable-uploads/1c66d3e6-15c7-4249-a02a-a6c5e488f6d6.png'  // LD Logo
];

// Chain image paths - ensuring they match the available files
const CHAIN_WITH_MEDAL1 = '/lovable-uploads/21178cfe-7a06-4bf7-927d-b8fb84577fa3.png';
const CHAIN_WITH_MEDAL2 = '/lovable-uploads/24a13e09-2b4f-48aa-94c4-7345050a0180.png';

const LogoAnimation: React.FC<{ onAnimationComplete?: () => void }> = ({ onAnimationComplete }) => {
  const navigate = useNavigate();
  const [animationState, setAnimationState] = useState(0);
  const [currentLogo, setCurrentLogo] = useState(0);
  const [showText, setShowText] = useState(true);
  const [yourColor, setYourColor] = useState('#0ca2ed');
  const [showLogo, setShowLogo] = useState(false);
  const [showChain, setShowChain] = useState(false);
  const [finalState, setFinalState] = useState(false);
  const [showButton, setShowButton] = useState(false);
  
  // Preload images
  useEffect(() => {
    console.log('Preloading images...');
    
    // Preload logos
    LOGOS.forEach((logo, index) => {
      const img = new Image();
      img.onload = () => console.log(`Logo ${index} loaded successfully`);
      img.onerror = () => console.warn(`Falling back to placeholder for logo ${index}`);
      img.src = logo;
    });
    
    // Preload chain images
    const chainImg1 = new Image();
    chainImg1.onload = () => console.log('Chain image 1 loaded successfully');
    chainImg1.onerror = () => console.warn('Failed to load chain image 1');
    chainImg1.src = CHAIN_WITH_MEDAL1;
    
    const chainImg2 = new Image();
    chainImg2.onload = () => console.log('Chain image 2 loaded successfully');
    chainImg2.onerror = () => console.warn('Failed to load chain image 2');
    chainImg2.src = CHAIN_WITH_MEDAL2;
  }, []);

  useEffect(() => {
    const timeline = [
      // Step 1: Intro animation (1s)
      setTimeout(() => {
        setAnimationState(1);
      }, 100),

      // Step 2: Paint animation to white (0.25s + 0.75s hold)
      setTimeout(() => {
        setYourColor('white');
        setAnimationState(2);
      }, 1100),

      // Step 3: Separate text for logo (0.7s)
      setTimeout(() => {
        setAnimationState(3);
      }, 2100),

      // Step 4: Glitch in logo (0.5s + 0.8s hold)
      setTimeout(() => {
        setShowLogo(true);
        setAnimationState(4);
      }, 2900),

      // Step 5-8: Flip through logos
      setTimeout(() => {
        setCurrentLogo(1);
        setAnimationState(5);
      }, 4200),

      setTimeout(() => {
        setCurrentLogo(2);
        setAnimationState(6);
      }, 5300),

      setTimeout(() => {
        setCurrentLogo(3);
        setAnimationState(7);
      }, 6400),

      // Step 9: Show final logo (0.7s hold)
      setTimeout(() => {
        setAnimationState(8);
      }, 7500),

      // Step 10: Chain zoom in, text fades (0.3s + 0.5s hold)
      setTimeout(() => {
        setShowChain(true);
        setShowText(false);
        setShowLogo(false);
        setAnimationState(9);
      }, 8200),

      // Step 11: Move chain up for button
      setTimeout(() => {
        setFinalState(true);
        setAnimationState(10);
      }, 9000),

      // Step 12: Show button
      setTimeout(() => {
        setShowButton(true);
        setAnimationState(11);
      }, 9500)
    ];

    return () => {
      timeline.forEach(timer => clearTimeout(timer));
    };
  }, []);

  const handleCustomizeClick = () => {
    if (onAnimationComplete) {
      onAnimationComplete();
    }
  };

  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Your/Logo Text Animation */}
      {showText && (
        <>
          <div 
            className="text-7xl font-bold mb-4"
            style={{
              fontFamily: 'Horizon, sans-serif',
              color: yourColor,
              animation: animationState === 1 
                ? 'slideFromTop 1s forwards' 
                : animationState === 2
                ? 'paintWipe 0.25s forwards'
                : animationState === 3
                ? 'moveApart 0.7s forwards'
                : '',
              transform: animationState >= 3 ? 'translateY(-60px)' : 'translateY(0)',
              opacity: animationState >= 1 ? 1 : 0,
              position: 'relative',
              zIndex: 10
            }}
          >
            Your
          </div>
          
          <div 
            className="text-7xl font-bold"
            style={{
              fontFamily: 'Horizon, sans-serif',
              color: 'white',
              animation: animationState === 1 
                ? 'slideFromBottom 1s forwards' 
                : animationState === 3
                ? 'moveDown 0.7s forwards'
                : '',
              transform: animationState >= 3 ? 'translateY(60px)' : 'translateY(0)',
              opacity: animationState >= 1 ? 1 : 0,
              position: 'relative',
              zIndex: 10
            }}
          >
            Logo
          </div>
        </>
      )}

      {/* Logo Animation */}
      {showLogo && (
        <div 
          className="absolute"
          style={{
            animation: animationState === 4 
              ? 'glitchIn 0.5s forwards' 
              : animationState >= 5 && animationState <= 7
              ? 'logoFlip 0.8s forwards'
              : '',
            perspective: '1000px',
            transformStyle: 'preserve-3d',
            zIndex: 5
          }}
        >
          {currentLogo === 0 && (
            <img 
              src={LOGOS[0]} 
              alt="Logo 1" 
              className="w-36 h-36 object-contain"
              onError={(e) => {
                console.error('Error loading logo 1');
                e.currentTarget.src = LOGO_FALLBACKS[0];
              }}
            />
          )}
          
          {currentLogo === 1 && (
            <img 
              src={LOGOS[1]} 
              alt="Logo 2" 
              className="w-36 h-36 object-contain"
              onError={(e) => {
                console.error('Error loading logo 2');
                e.currentTarget.src = LOGO_FALLBACKS[1];
              }}
            />
          )}
          
          {currentLogo === 2 && (
            <img 
              src={LOGOS[2]} 
              alt="Logo 3" 
              className="w-36 h-36 object-contain"
              onError={(e) => {
                console.error('Error loading logo 3');
                e.currentTarget.src = LOGO_FALLBACKS[2];
              }}
            />
          )}
          
          {currentLogo === 3 && (
            <img 
              src={LOGOS[3]} 
              alt="Logo 4" 
              className="w-36 h-36 object-contain"
              onError={(e) => {
                console.error('Error loading logo 4');
                e.currentTarget.src = LOGO_FALLBACKS[3];
              }}
            />
          )}
        </div>
      )}

      {/* Chain Animation - First Position */}
      {showChain && !finalState && (
        <div 
          className="absolute"
          style={{
            animation: 'crashZoom 0.8s forwards',
            zIndex: 20
          }}
        >
          <img 
            src={CHAIN_WITH_MEDAL1} 
            alt="Chain with Medal" 
            className="w-64 h-auto"
            onError={(e) => {
              console.error('Error loading chain 1');
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        </div>
      )}

      {/* Chain Animation - Moving Up Position */}
      {finalState && (
        <div 
          className="absolute"
          style={{
            animation: 'chainMove 0.8s forwards',
            zIndex: 20
          }}
        >
          <img 
            src={CHAIN_WITH_MEDAL1} // Using the same image for smooth transition
            alt="Chain with Medal" 
            className="w-64 h-auto"
            onError={(e) => {
              console.error('Error loading chain 2');
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        </div>
      )}

      {/* Button */}
      {showButton && (
        <div 
          className="absolute bottom-32"
          style={{
            animation: 'buttonAppear 0.5s forwards',
            zIndex: 30
          }}
        >
          <Button 
            onClick={handleCustomizeClick}
            className="bg-primary hover:bg-primary/90 text-white font-bold py-4 px-10 rounded-lg text-xl flex items-center gap-3 shadow-lg transition-all hover:scale-105"
            size="lg"
          >
            Customize Now <ArrowRight className="h-6 w-6 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default LogoAnimation;
