
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

export const FundraiserLoadingState = () => {
  const isMobile = useIsMobile();

  return (
    <div className="max-w-6xl mx-auto">
      <Skeleton className="h-8 w-3/4 mb-4" />
      <Skeleton className="h-24 w-full mb-8" />
      <div className="grid md:grid-cols-2 gap-8">
        <Skeleton className="aspect-square" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
      {isMobile && (
        <div className="mt-4 text-center text-sm text-gray-400">
          Loading on mobile device...
        </div>
      )}
    </div>
  );
};
