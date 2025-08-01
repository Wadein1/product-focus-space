import React, { useState } from 'react';
import { X } from 'lucide-react';
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
        <div className="bg-green-600 text-white rounded-lg p-6 max-w-sm w-full shadow-xl animate-scale-in">
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setDismissed(true)}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="text-center space-y-4">
            <p className="font-medium text-lg">
              Learn more about how you can have your own fundraiser
            </p>
            <Button
              onClick={() => navigate('/fundraising')}
              variant="secondary"
              size="sm"
              className="bg-white text-green-600 hover:bg-gray-100 w-full"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-green-600 text-white px-4 py-3 z-[60] shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <p className="font-medium">
            Learn more about how you can have your own fundraiser
          </p>
          <Button
            onClick={() => navigate('/fundraising')}
            variant="secondary"
            size="sm"
            className="bg-white text-green-600 hover:bg-gray-100"
          >
            Get Started
          </Button>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-white hover:text-gray-200 transition-colors ml-4 flex-shrink-0"
          aria-label="Dismiss banner"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};