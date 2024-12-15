import { useState, useEffect } from "react";

export const useHeroImages = () => {
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    const imageUrls = [
      "/lovable-uploads/1c66d3e6-15c7-4249-a02a-a6c5e488f6d6.png",
      "/lovable-uploads/d6daae6b-a26c-4424-a049-ee61f42f02c3.png",
      "/lovable-uploads/c3b67733-225f-4e30-9363-e13d20ed3100.png"
    ];

    Promise.all(
      imageUrls.map(url => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = url;
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
        });
      })
    ).then(() => {
      setImagesLoaded(true);
    });
  }, []);

  return { imagesLoaded };
};