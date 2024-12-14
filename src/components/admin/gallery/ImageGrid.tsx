import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface GalleryImage {
  id: string;
  image_path: string;
}

export function ImageGrid() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const deleteImageMutation = useMutation({
    mutationFn: async (image: GalleryImage) => {
      const { error: storageError } = await supabase.storage
        .from('gallery')
        .remove([image.image_path]);
      
      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', image.id);
      
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
      toast({
        title: "Success",
        description: "Image deleted successfully"
      });
    },
    onError: (error) => {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return <div>Loading images...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images?.map((image) => {
        const imageUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/gallery/${image.image_path}`;
        return (
          <div
            key={image.id}
            className="relative group overflow-hidden rounded-lg border"
          >
            <img
              src={imageUrl}
              alt={`Gallery image ${image.id}`}
              className="w-full h-48 object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteImageMutation.mutate(image)}
                disabled={deleteImageMutation.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}