import { useState, useEffect } from "react";

export const useHeroImages = () => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  
  const images = [
    "/lovable-uploads/58df6f8a-5ec7-42aa-aabf-60378b61c658.png",
    "/lovable-uploads/44c77c3c-6fe3-4881-8f1a-a9ae8f56c96b.png",
    "/lovable-uploads/78980ed8-8186-4f97-bf87-fa197d050aa8.png"
  ];

  useEffect(() => {
    Promise.all(
      images.map(url => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = url;
          img.onload = () => {
            setLoadedCount(prev => prev + 1);
            resolve(true);
          };
          img.onerror = () => resolve(false);
        });
      })
    ).then(() => {
      setImagesLoaded(true);
    });
  }, []);

  return { imagesLoaded, images, loadedCount };
};