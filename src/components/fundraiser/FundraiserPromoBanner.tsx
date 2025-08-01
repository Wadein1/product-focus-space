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
    <div className="fixed top-4 right-4 bg-green-600 text-white rounded-lg shadow-lg px-6 py-4 z-40 max-w-md animate-slide-in-right">
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-4">
          <p className="font-medium text-sm mb-2">
            Learn more about how you can have your own fundraiser
          </p>
          <Button
            onClick={() => navigate('/fundraising')}
            variant="secondary"
            size="sm"
            className="bg-white text-green-600 hover:bg-gray-100 text-xs"
          >
            Get Started
          </Button>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-white hover:text-gray-200 transition-colors flex-shrink-0"
          aria-label="Dismiss notification"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};