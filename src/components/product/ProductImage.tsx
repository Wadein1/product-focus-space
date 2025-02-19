
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
  "/lovable-uploads/da9b0a6c-fa30-4794-b0ee-b3d1421fa5bb.png",
  "/lovable-uploads/bd537e86-da88-4db9-a995-3b6b16ab44c4.png",
  "/lovable-uploads/1fe41b9d-e18b-48aa-a4d0-b5c549cf0186.png",
  "/lovable-uploads/bd59d6f3-3ec4-4c14-ad3e-02345ca5d61d.png"
] as const;

export const ProductImage = ({ 
  imagePreview, 
  onFileChange,
  isUploading = false
}: ProductImageProps) => {
  const { toast } = useToast();
  const [carouselRef, carouselApi] = useEmblaCarousel({ 
    loop: true,
    startIndex: imagePreview ? PRODUCT_IMAGES.length : 0 // Start at uploaded image if it exists
  });

  // Combine default images with uploaded image if it exists
  const allImages = imagePreview 
    ? [...PRODUCT_IMAGES, imagePreview]
    : PRODUCT_IMAGES;

  // Navigate to the uploaded image when it's added
  React.useEffect(() => {
    if (imagePreview && carouselApi) {
      // Force a reflow to ensure the carousel updates
      setTimeout(() => {
        carouselApi.scrollTo(PRODUCT_IMAGES.length);
      }, 0);
    }
  }, [imagePreview, carouselApi]);

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

          // Create a temporary URL for immediate preview
          const tempUrl = URL.createObjectURL(processedFile);
          const img = new Image();
          img.onload = () => {
            onFileChange(processedFile);
            URL.revokeObjectURL(tempUrl);
          };
          img.src = tempUrl;

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
        <Carousel 
          ref={carouselRef}
          className="w-full"
          opts={{
            loop: true,
            startIndex: imagePreview ? PRODUCT_IMAGES.length : 0
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
