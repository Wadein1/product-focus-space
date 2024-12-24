import { useState, useEffect } from "react";

const HERO_IMAGES = [
  "/lovable-uploads/21178cfe-7a06-4bf7-927d-b8fb84577fa3.png",
  "/lovable-uploads/f42d99d3-0012-46d1-b59f-33e938dbde96.png",
  "/lovable-uploads/076015c7-e9ad-43f0-a29f-c9a923ffc91b.png"
] as const;

export const useHeroImages = () => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    let loadedImages = 0;

    const preloadImage = (src: string) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        if (!mounted) return;
        loadedImages++;
        setLoadedCount(loadedImages);
        if (loadedImages === HERO_IMAGES.length) {
          setImagesLoaded(true);
        }
      };
      img.onerror = () => {
        if (!mounted) return;
        loadedImages++;
        setLoadedCount(loadedImages);
        console.error(`Failed to load image: ${src}`);
      };
    };

    HERO_IMAGES.forEach(preloadImage);

    return () => {
      mounted = false;
    };
  }, []);

  return { 
    imagesLoaded,
    loadedCount,
    totalImages: HERO_IMAGES.length,
    images: HERO_IMAGES
  };
};