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
import useEmblaCarousel from 'embla-carousel-react';

interface ProductImageProps {
  imagePreview: string | null;
  onFileChange: (file: File) => void;
  isUploading?: boolean;
}

const PRODUCT_IMAGES = [
  "/lovable-uploads/a1782a0f-f381-463e-95d5-2494f1a03f41.png",
  "/lovable-uploads/12631842-f4a2-49fc-af99-15b2492366e0.png",
  "/lovable-uploads/3082aca0-68e8-4481-b166-6f7890867f7d.png"
] as const;

export const ProductImage = ({ 
  imagePreview, 
  onFileChange,
  isUploading = false
}: ProductImageProps) => {
  const { toast } = useToast();
  const [carouselRef, carouselApi] = useEmblaCarousel({ 
    loop: true // Enable infinite scroll
  });

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

  // Combine default images with uploaded image if it exists
  const allImages = imagePreview 
    ? [...PRODUCT_IMAGES, imagePreview]
    : PRODUCT_IMAGES;

  return (
    <div className="space-y-4">
      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
        <Carousel 
          ref={carouselRef}
          className="w-full"
          opts={{
            loop: true, // Enable infinite scroll
            align: "start"
          }}
        >
          <CarouselContent>
            {allImages.map((image, index) => (
              <CarouselItem key={index}>
                <div className="aspect-square relative">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
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