
import React from 'react';

interface FundraiserHeaderProps {
  title: string;
  donationText: string;
}

export const FundraiserHeader = ({ title, donationText }: FundraiserHeaderProps) => {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-4xl font-bold mb-4 text-foreground">{title}</h1>
      <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
        <p className="text-green-400 font-medium">
          {donationText}
        </p>
      </div>
    </div>
  );
};
