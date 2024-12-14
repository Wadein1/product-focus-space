import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";

interface GalleryImage {
  id: string;
  image_path: string;
  title: string | null;
  description: string | null;
}

const Gallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await supabase
          .from('gallery_images')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setImages(data || []);
      } catch (error) {
        console.error('Error fetching gallery images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading) {
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
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group overflow-hidden rounded-lg shadow-lg"
            >
              <img
                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/gallery/${image.image_path}`}
                alt={image.title || "Gallery image"}
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              {(image.title || image.description) && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                  {image.title && (
                    <h3 className="text-lg font-semibold">{image.title}</h3>
                  )}
                  {image.description && (
                    <p className="text-sm mt-1">{image.description}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        {images.length === 0 && (
          <div className="text-center text-muted-foreground">
            No images available in the gallery yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;