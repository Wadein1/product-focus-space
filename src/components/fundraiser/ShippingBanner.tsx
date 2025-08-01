import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ShippingBannerProps {
  show: boolean;
}

export const ShippingBanner = ({ show }: ShippingBannerProps) => {
  const [dismissed, setDismissed] = useState(false);

  if (!show || dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-destructive text-destructive-foreground px-4 py-3 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <p className="text-center flex-1 font-medium">
          This fundraiser has been closed to ensure products can be delivered before Christmas
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="text-destructive-foreground hover:text-destructive-foreground/80 transition-colors ml-4 flex-shrink-0"
          aria-label="Dismiss banner"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};