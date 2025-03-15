
import React from 'react';

export const AnimationStyles: React.FC = () => {
  return (
    <style>
      {`
        @keyframes glitch {
          0% {
            transform: translate(0);
            filter: brightness(1);
          }
          20% {
            transform: translate(-5px, 5px);
            filter: brightness(1.1);
          }
          40% {
            transform: translate(-5px, -5px);
            filter: brightness(0.9);
          }
          60% {
            transform: translate(5px, 5px) skewX(5deg);
            filter: brightness(1.2) contrast(1.1);
          }
          80% {
            transform: translate(5px, -5px);
            filter: brightness(0.9) contrast(1.2);
          }
          100% {
            transform: translate(0);
            filter: brightness(1);
          }
        }
        
        .animate-glitch {
          animation: glitch 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }
        
        @keyframes push-zoom {
          0% {
            transform: scale(0.1);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-push-zoom {
          animation: push-zoom 0.7s cubic-bezier(0.16, 1, 0.3, 1.6) forwards;
        }
        
        .push-out {
          transform: translate(200%, 200%) scale(0.5) !important;
          opacity: 0 !important;
          transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1.6) !important;
        }
        
        .push-out-top {
          transform: translate(-200%, -300%) scale(0.5) !important;
          opacity: 0 !important;
          transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1.6) !important;
        }
        
        .push-out-bottom {
          transform: translate(200%, 300%) scale(0.5) !important;
          opacity: 0 !important;
          transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1.6) !important;
        }

        .ease-out {
          transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1.6);
        }
      `}
    </style>
  );
};
