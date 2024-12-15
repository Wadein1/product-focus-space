import { useState, useEffect } from "react";

const HERO_IMAGES = [
  "/lovable-uploads/1c66d3e6-15c7-4249-a02a-a6c5e488f6d6.png",
  "/lovable-uploads/d6daae6b-a26c-4424-a049-ee61f42f02c3.png",
  "/lovable-uploads/c3b67733-225f-4e30-9363-e13d20ed3100.png"
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