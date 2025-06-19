
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface MobileLoadingScreenProps {
  show: boolean;
  progress: number;
}

export const MobileLoadingScreen = ({ show, progress }: MobileLoadingScreenProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-background to-secondary z-50 flex flex-col items-center justify-center">
      <div className="w-full max-w-sm px-8 space-y-8">
        {/* Logo/Brand area */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-8 h-8 bg-primary rounded-full animate-bounce" />
          </div>
          <h2 className="text-xl font-semibold text-foreground animate-fade-in">
            Loading Fundraiser...
          </h2>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {progress < 50 ? 'Loading data...' : progress < 80 ? 'Preparing images...' : 'Almost ready!'}
          </p>
        </div>

        {/* Animated skeleton preview */}
        <div className="space-y-4 opacity-60">
          <Skeleton className="h-4 w-3/4 mx-auto" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-square rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
