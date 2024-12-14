import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";

interface GalleryImage {
  id: string;
  image_path: string;
}

const Gallery = () => {
  const { data: images, isLoading } = useQuery({
    queryKey: ['gallery-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as GalleryImage[];
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 mt-16">
          <div className="text-center">Loading gallery...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-16">
        <h1 className="text-4xl font-bold mb-8">Gallery</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images?.map((image) => (
            <div
              key={image.id}
              className="relative group overflow-hidden rounded-lg shadow-lg"
            >
              <img
                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/gallery/${image.image_path}`}
                alt="Gallery image"
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
          ))}
        </div>
        {images?.length === 0 && (
          <div className="text-center text-muted-foreground">
            No images available in the gallery yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;