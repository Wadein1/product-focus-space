import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface GalleryImage {
  id: string;
  image_path: string;
  title: string | null;
  description: string | null;
}

export function PhotoManagement() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
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
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('gallery')
        .remove([image.image_path]);
      
      if (storageError) throw storageError;

      // Delete from database
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive"
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an image to upload",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Save to database
      const { error: dbError } = await supabase
        .from('gallery_images')
        .insert({
          image_path: filePath,
          title: title || null,
          description: description || null
        });

      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
      toast({
        title: "Success",
        description: "Image uploaded successfully"
      });

      // Reset form
      setSelectedFile(null);
      setTitle("");
      setDescription("");
      if (document.querySelector<HTMLInputElement>('input[type="file"]')) {
        document.querySelector<HTMLInputElement>('input[type="file"]')!.value = '';
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 p-4 border rounded-lg">
        <div className="space-y-2">
          <Label htmlFor="image">Upload Image</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Title (optional)</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter image title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter image description"
          />
        </div>
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? "Uploading..." : "Upload Image"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div>Loading images...</div>
        ) : (
          images?.map((image) => (
            <div
              key={image.id}
              className="relative group overflow-hidden rounded-lg border"
            >
              <img
                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/gallery/${image.image_path}`}
                alt={image.title || "Gallery image"}
                className="w-full h-48 object-cover"
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
              {image.title && (
                <div className="p-2 bg-white border-t">
                  <h3 className="font-medium">{image.title}</h3>
                  {image.description && (
                    <p className="text-sm text-gray-600">{image.description}</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}