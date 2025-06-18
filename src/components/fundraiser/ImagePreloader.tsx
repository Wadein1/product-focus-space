
import React from 'react';

interface ImagePreloaderProps {
  imageUrls: string[];
  priority?: boolean;
}

export const ImagePreloader = ({ imageUrls, priority = false }: ImagePreloaderProps) => {
  React.useEffect(() => {
    // Preload critical images
    imageUrls.forEach((url, index) => {
      if (url) {
        const link = document.createElement('link');
        link.rel = priority && index === 0 ? 'preload' : 'prefetch';
        link.as = 'image';
        link.href = url;
        document.head.appendChild(link);
        
        // Clean up on unmount
        return () => {
          if (document.head.contains(link)) {
            document.head.removeChild(link);
          }
        };
      }
    });
  }, [imageUrls, priority]);

  return null;
};
