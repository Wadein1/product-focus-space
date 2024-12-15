import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Loader2 } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-16 mt-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Our Gallery
          </h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {images?.map((image) => (
              <div
                key={image.id}
                className="group relative overflow-hidden rounded-xl shadow-lg bg-white hover:shadow-xl transition-all duration-300 animate-fade-in"
              >
                <div className="aspect-w-4 aspect-h-3">
                  <img
                    src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/gallery/${image.image_path}`}
                    alt="Gallery image"
                    className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      console.error(`Failed to load image: ${target.src}`);
                      target.src = '/placeholder.svg';
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-6 text-white">
                    <p className="font-medium">View Details</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {images?.length === 0 && (
          <div className="text-center text-gray-500 py-16">
            <p className="text-lg">No images available in the gallery yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;