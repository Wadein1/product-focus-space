import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface FundraiserImagesProps {
  mainImage: string;
  title: string;
}

export const FundraiserImages = ({ mainImage, title }: FundraiserImagesProps) => {
  return (
    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
      {mainImage ? (
        <img
          src={mainImage}
          alt={title}
          className="w-full h-full object-cover"
          loading="eager"
        />
      ) : (
        <Skeleton className="w-full h-full" />
      )}
    </div>
  );
};