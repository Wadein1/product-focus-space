
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import './animations.css';

// New logo paths from the uploaded images
const NEW_LOGOS = [
  '/lovable-uploads/c8aff20f-bcb8-4c3e-9d3f-42b809fdd22d.png', // BC Logo
  '/lovable-uploads/ec6bb5f3-ce0c-412c-8e88-75b6e7483872.png', // Bulldog Logo
  '/lovable-uploads/d6a421f1-8108-4386-93dc-892eeaf2f43d.png', // TH Logo
  '/lovable-uploads/a28ca068-4cea-4793-96fb-dd828a3965af.png'  // Custom Logo
];

// Chain image path
const CHAIN_WITH_MEDAL = '/lovable-uploads/fae8eaa1-c48e-403f-b21a-adbf79337f50.png';

// Fallback images
const LOGO_FALLBACKS = [
  '/placeholder.svg',
  '/placeholder.svg',
  '/placeholder.svg',
  '/placeholder.svg'
];

const LogoAnimation: React.FC<{ onAnimationComplete?: () => void }> = ({ onAnimationComplete }) => {
  const [animationState, setAnimationState] = useState(0);
  const [currentLogo, setCurrentLogo] = useState(0);
  const [showText, setShowText] = useState(true);
  const [yourColor, setYourColor] = useState('#0ca2ed');
  const [showLogo, setShowLogo] = useState(false);
  const [showChain, setShowChain] = useState(false);
  const [finalState, setFinalState] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'in' | 'out' | null>(null);
  const [textSeparated, setTextSeparated] = useState(false);
  
  // Preload images
  useEffect(() => {
    console.log('Preloading new logo images...');
    
    // Preload new logos
    NEW_LOGOS.forEach((logo, index) => {
      const img = new Image();
      img.onload = () => console.log(`New Logo ${index} loaded successfully`);
      img.onerror = () => console.warn(`Falling back to placeholder for new logo ${index}`);
      img.src = logo;
    });
    
    // Preload chain image
    const chainImg = new Image();
    chainImg.onload = () => console.log('Chain image loaded successfully');
    chainImg.onerror = () => console.warn('Failed to load chain image');
    chainImg.src = CHAIN_WITH_MEDAL;
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

      // Step 3: Separate text (0.7s)
      setTimeout(() => {
        setAnimationState(3);
        setTextSeparated(true);
      }, 2100),

      // Step 4: Show first logo
      setTimeout(() => {
        setShowLogo(true);
        setAnimationState(4);
      }, 2900),

      // Step 5-8: Swipe through logos
      setTimeout(() => {
        setSwipeDirection('out');
        setTimeout(() => {
          setCurrentLogo(1);
          setSwipeDirection('in');
        }, 500);
        setAnimationState(5);
      }, 4200),

      setTimeout(() => {
        setSwipeDirection('out');
        setTimeout(() => {
          setCurrentLogo(2);
          setSwipeDirection('in');
        }, 500);
        setAnimationState(6);
      }, 6000),

      setTimeout(() => {
        setSwipeDirection('out');
        setTimeout(() => {
          setCurrentLogo(3);
          setSwipeDirection('in');
        }, 500);
        setAnimationState(7);
      }, 7800),

      // Step 9: Hold final logo (0.7s)
      setTimeout(() => {
        setAnimationState(8);
      }, 9600),

      // Step 10: Show chain and fade text
      setTimeout(() => {
        setShowChain(true);
        setShowText(false);
        setShowLogo(false);
        setAnimationState(9);
      }, 10300),

      // Step 11: Move chain up for button
      setTimeout(() => {
        setFinalState(true);
        setAnimationState(10);
      }, 11000),

      // Step 12: Show button
      setTimeout(() => {
        setShowButton(true);
        setAnimationState(11);
      }, 11500)
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
      {/* Central Content Container for better positioning */}
      <div className="flex flex-col items-center justify-center h-full w-full relative">
        {/* Your/Logo Text Animation */}
        {showText && (
          <>
            <div 
              className="text-8xl font-bold mb-4 transition-all duration-700"
              style={{
                fontFamily: 'Horizon, sans-serif',
                color: yourColor,
                animation: animationState === 1 
                  ? 'slideFromTop 1s forwards' 
                  : animationState === 2
                  ? 'paintWipe 0.25s forwards'
                  : textSeparated
                  ? 'moveApart 0.7s forwards'
                  : '',
                transform: textSeparated ? 'translateY(-60px)' : 'translateY(0)',
                opacity: animationState >= 1 ? 1 : 0,
                position: 'relative',
                zIndex: 10
              }}
            >
              Your
            </div>
            
            <div 
              className="text-8xl font-bold transition-all duration-700"
              style={{
                fontFamily: 'Horizon, sans-serif',
                color: 'white',
                animation: animationState === 1 
                  ? 'slideFromBottom 1s forwards' 
                  : textSeparated
                  ? 'moveDown 0.7s forwards'
                  : '',
                transform: textSeparated ? 'translateY(60px)' : 'translateY(0)',
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
              animation: swipeDirection === 'out' 
                ? 'swipeOutLeft 0.5s forwards' 
                : swipeDirection === 'in'
                ? 'swipeInRight 0.5s forwards'
                : '',
              zIndex: 5
            }}
          >
            <img 
              src={NEW_LOGOS[currentLogo]} 
              alt={`Logo ${currentLogo + 1}`} 
              className="w-48 h-48 object-contain"
              onError={(e) => {
                console.error(`Error loading logo ${currentLogo + 1}`);
                e.currentTarget.src = LOGO_FALLBACKS[currentLogo];
              }}
            />
          </div>
        )}

        {/* Chain Animation - First Position */}
        {showChain && !finalState && (
          <div 
            className="absolute"
            style={{
              animation: 'smoothZoom 0.8s forwards',
              zIndex: 20
            }}
          >
            <img 
              src={CHAIN_WITH_MEDAL} 
              alt="Chain with Medal" 
              className="w-80 h-auto"
              onError={(e) => {
                console.error('Error loading chain');
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
              src={CHAIN_WITH_MEDAL}
              alt="Chain with Medal" 
              className="w-80 h-auto"
              onError={(e) => {
                console.error('Error loading chain in final state');
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          </div>
        )}

        {/* Button */}
        {showButton && (
          <div 
            className="absolute bottom-1/4"
            style={{
              animation: 'buttonAppear 0.5s forwards',
              zIndex: 30
            }}
          >
            <Button 
              onClick={handleCustomizeClick}
              className="bg-primary hover:bg-primary/90 text-white font-bold py-6 px-12 rounded-lg text-2xl flex items-center gap-4 shadow-lg transition-all hover:scale-105"
              size="lg"
            >
              Customize Now <ArrowRight className="h-7 w-7" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoAnimation;
