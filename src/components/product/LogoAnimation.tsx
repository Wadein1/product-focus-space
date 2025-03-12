
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import './animations.css';

const logos = [
  '/lovable-uploads/babeef53-543a-477d-8c5c-5c7b4623422d.png', // TH Logo
  '/lovable-uploads/0f909dbc-f06f-4aa2-93e1-09cc666acd9e.png', // BC Logo
  '/lovable-uploads/ddcd43bd-a3c9-4d7f-8bc6-cc06e5e9a9f8.png', // Bulldog Logo
  '/lovable-uploads/a72972b9-be3b-4cb4-bb4a-2f731acbc134.png'  // LD Logo
];

const chainWithMedal1 = '/lovable-uploads/453fccb2-d098-4beb-ada8-cc35e7eb67f1.png';
const chainWithMedal2 = '/lovable-uploads/3b1935a1-41e0-4748-8d3d-24cfb232a0f7.png';

const LogoAnimation: React.FC = () => {
  const navigate = useNavigate();
  const [animationState, setAnimationState] = useState(0);
  const [currentLogo, setCurrentLogo] = useState(0);
  const [showText, setShowText] = useState(true);
  const [yourColor, setYourColor] = useState('#0ca2ed');
  const [showLogo, setShowLogo] = useState(false);
  const [showChain, setShowChain] = useState(false);
  const [finalState, setFinalState] = useState(false);
  const [showButton, setShowButton] = useState(false);

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

      // Step 3: Separate text for logo (0.8s)
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
    navigate('/product');
  };

  // Fixed: Replace CSS custom properties with actual transform values
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
                ? 'moveApart 0.8s forwards'
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
                ? 'moveApart 0.8s forwards'
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
              ? 'logoFlip 0.4s forwards'
              : '',
            perspective: '1000px',
            transformStyle: 'preserve-3d',
            zIndex: 5
          }}
        >
          {currentLogo === 0 && (
            <img 
              src={logos[0]} 
              alt="Logo 1" 
              className="w-20 h-20"
            />
          )}
          
          {currentLogo === 1 && (
            <img 
              src={logos[1]} 
              alt="Logo 2" 
              className="w-36 h-20"
            />
          )}
          
          {currentLogo === 2 && (
            <img 
              src={logos[2]} 
              alt="Logo 3" 
              className="w-36 h-20"
            />
          )}
          
          {currentLogo === 3 && (
            <img 
              src={logos[3]} 
              alt="Logo 4" 
              className="w-36 h-20"
            />
          )}
        </div>
      )}

      {/* Chain Animation */}
      {showChain && !finalState && (
        <div 
          className="absolute"
          style={{
            animation: 'crashZoom 0.3s forwards',
            zIndex: 20
          }}
        >
          <img 
            src={chainWithMedal1} 
            alt="Chain with Medal" 
            className="w-64 h-auto"
          />
        </div>
      )}

      {/* Final Chain Position */}
      {finalState && (
        <div 
          className="absolute"
          style={{
            animation: 'moveUp 0.5s forwards',
            zIndex: 20
          }}
        >
          <img 
            src={chainWithMedal2} 
            alt="Chain with Medal" 
            className="w-64 h-auto"
          />
        </div>
      )}

      {/* Button */}
      {showButton && (
        <div 
          className="absolute bottom-40"
          style={{
            animation: 'buttonAppear 0.5s forwards',
            zIndex: 30
          }}
        >
          <Button 
            onClick={handleCustomizeClick}
            className="bg-primary text-black font-bold py-3 px-8 rounded-full text-lg flex items-center gap-2"
          >
            Customize Now <ArrowRight className="ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default LogoAnimation;
