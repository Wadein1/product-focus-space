import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface FundraiserPromoBannerProps {
  show: boolean;
}

export const FundraiserPromoBanner = ({ show }: FundraiserPromoBannerProps) => {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (!show || dismissed) return null;

  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
        <div className="relative bg-green-500 rounded-lg p-6 max-w-sm w-full shadow-xl animate-scale-in overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600"></div>
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255,255,255,0.1) 10px,
                rgba(255,255,255,0.1) 20px
              )`
            }}></div>
          </div>
          
          {/* Close Button */}
          <div className="relative flex justify-end mb-3">
            <button
              onClick={() => setDismissed(true)}
              className="text-white hover:text-gray-200 transition-colors p-1"
              aria-label="Dismiss banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="relative text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Check className="w-6 h-6 text-black" />
              <h3 className="font-bold text-xl text-black">
                READY TO MAKE AN IMPACT?
              </h3>
            </div>
            <p className="text-black font-medium text-sm leading-relaxed">
              Start your own custom fundraiser! It's fast, easy, and rewarding.
            </p>
            <Button
              onClick={() => navigate('/fundraising')}
              className="bg-black text-white hover:bg-gray-800 w-full font-bold py-3"
            >
              🚀 GET STARTED
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-green-500 px-4 py-3 z-[60] shadow-lg overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 15px,
            rgba(255,255,255,0.1) 15px,
            rgba(255,255,255,0.1) 30px
          )`
        }}></div>
      </div>
      
      <div className="container mx-auto flex items-center justify-between relative">
        <div className="flex items-center space-x-4 flex-1">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-black" />
            <span className="font-bold text-black">READY TO MAKE AN IMPACT?</span>
          </div>
          <span className="text-black font-medium text-sm hidden sm:inline">
            Start your own custom fundraiser! It's fast, easy, and rewarding.
          </span>
          <Button
            onClick={() => navigate('/fundraising')}
            className="bg-black text-white hover:bg-gray-800 font-bold"
            size="sm"
          >
            🚀 GET STARTED
          </Button>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-white hover:text-gray-200 transition-colors ml-4 flex-shrink-0 p-1"
          aria-label="Dismiss banner"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};