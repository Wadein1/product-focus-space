
import React, { useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface ProgressiveImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  showSkeleton?: boolean;
  priority?: boolean;
}

export const ProgressiveImageLoader = ({
  src,
  alt,
  className = "",
  onLoad,
  onError,
  showSkeleton = true,
  priority = false,
}: ProgressiveImageLoaderProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    onError?.();
  };

  if (error) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <p className="text-gray-500 text-sm">Image unavailable</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {loading && showSkeleton && (
        <div className="absolute inset-0 z-10">
          <Skeleton className="w-full h-full" />
        </div>
      )}
      
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? "eager" : "lazy"}
      />
      
      {loading && !showSkeleton && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
    </div>
  );
};
