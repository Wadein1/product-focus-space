
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface ImageData {
  id: string;
  url: string;
  loaded: boolean;
}

export const useImageBatch = (imagePaths: { id: string; path: string }[]) => {
  const [images, setImages] = useState<Record<string, ImageData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      if (!imagePaths?.length) {
        setLoading(false);
        return;
      }

      console.log('Batch loading images:', imagePaths.length);
      
      // Generate all URLs at once
      const imageMap: Record<string, ImageData> = {};
      
      imagePaths.forEach(({ id, path }) => {
        if (path) {
          const { data: { publicUrl } } = supabase
            .storage
            .from('gallery')
            .getPublicUrl(path);
          
          imageMap[id] = {
            id,
            url: publicUrl,
            loaded: false
          };
        }
      });

      setImages(imageMap);
      setLoading(false);
      
      console.log('Batch image URLs generated:', Object.keys(imageMap).length);
    };

    loadImages();
  }, [imagePaths]);

  const markImageLoaded = (id: string) => {
    setImages(prev => ({
      ...prev,
      [id]: prev[id] ? { ...prev[id], loaded: true } : prev[id]
    }));
  };

  return {
    images,
    loading,
    markImageLoaded
  };
};
