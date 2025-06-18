
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from "@/hooks/use-mobile";

interface FundraiserErrorStateProps {
  error?: any;
}

export const FundraiserErrorState = ({ error }: FundraiserErrorStateProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  console.error('FundraiserPage error:', error);

  return (
    <div className="max-w-6xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Fundraiser not found</h1>
      <p className="text-gray-400 mb-4">
        Device: {isMobile ? 'Mobile' : 'Desktop'}
      </p>
      <button 
        onClick={() => navigate('/')}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
      >
        Go Home
      </button>
    </div>
  );
};
