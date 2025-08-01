import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface FundraiserPromoBannerProps {
  show: boolean;
}

export const FundraiserPromoBanner = ({ show }: FundraiserPromoBannerProps) => {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  if (!show || dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-green-600 text-white px-4 py-3 z-40 shadow-lg">
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