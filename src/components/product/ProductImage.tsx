import React from 'react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { compressImage } from '@/utils/imageCompression';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ProductImageProps {
  imagePreview: string | null;
  onFileChange: (file: File) => void;
  isUploading?: boolean;
}

export const ProductImage = ({ 
  imagePreview, 
  onFileChange,
  isUploading = false
}: ProductImageProps) => {
  const { toast } = useToast();
  const defaultImages = [
    "/lovable-uploads/1fadc4b9-8c21-46bb-87f6-4bcc68b8db85.png",
    "/lovable-uploads/8e614d69-0544-432b-86a5-2f6ee2972000.png",
    "/lovable-uploads/996f2306-0299-402f-a5d7-90b1c7aae7ce.png"
  ];

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        try {
          if (file.size > 1024 * 1024) {
            toast({
              title: "Compressing image",
              description: "Large image detected. Compressing...",
            });
          }

          const processedFile = await compressImage(file);
          
          if (processedFile.size < file.size) {
            toast({
              title: "Image compressed",
              description: `Reduced from ${(file.size / (1024 * 1024)).toFixed(2)}MB to ${(processedFile.size / (1024 * 1024)).toFixed(2)}MB`,
            });
          }

          onFileChange(processedFile);
        } catch (error) {
          console.error('Error processing image:', error);
          toast({
            title: "Error processing image",
            description: "Failed to process the image. Please try again.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
        <Carousel className="w-full">
          <CarouselContent>
            {(imagePreview ? [imagePreview, ...defaultImages] : defaultImages).map((image, index) => (
              <CarouselItem key={index}>
                <div className="aspect-square w-full">
                  <img
                    src={image}
                    alt={`Product view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Upload Your Design
        </label>
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full"
          disabled={isUploading}
        />
        <p className="text-sm text-gray-500">
          Upload the image you want on your medallion
        </p>
      </div>
    </div>
  );
};