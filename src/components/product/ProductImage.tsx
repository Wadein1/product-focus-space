
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
  teamName: string;
  teamLocation: string;
  onTeamNameChange: (value: string) => void;
  onTeamLocationChange: (value: string) => void;
  isMobile?: boolean;
}

const PRODUCT_IMAGES = [
  "/lovable-uploads/b7396534-c265-4908-ab9d-6dd019d96829.png",
  "/lovable-uploads/005037c2-e08c-4ae1-a114-585cdd3cbfc4.png",
  "/lovable-uploads/24a9806e-f137-43e5-a22c-d8cf4a9a7c8b.png",
  "/lovable-uploads/465db4f4-e102-4d26-ae83-c222d933a234.png"
] as const;

export const ProductImage = ({ 
  imagePreview, 
  onFileChange,
  isUploading = false,
  teamName,
  teamLocation,
  onTeamNameChange,
  onTeamLocationChange,
  isMobile = false
}: ProductImageProps) => {
  const { toast } = useToast();
  const [carouselRef, carouselApi] = useEmblaCarousel({ 
    loop: true,
    startIndex: imagePreview ? PRODUCT_IMAGES.length : 0
  });

  const allImages = imagePreview 
    ? [...PRODUCT_IMAGES, imagePreview]
    : PRODUCT_IMAGES;

  React.useEffect(() => {
    if (imagePreview && carouselApi) {
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

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {isMobile ? "Upload Your Logo" : "Upload Your Design"}
          </label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
            disabled={isUploading}
          />
        </div>

        <div className="flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Team information - We'll find your logo
          </label>
          <Input
            type="text"
            placeholder="Team Name"
            value={teamName}
            onChange={(e) => onTeamNameChange(e.target.value)}
            className="w-full"
          />
          <Input
            type="text"
            placeholder="Team Location"
            value={teamLocation}
            onChange={(e) => onTeamLocationChange(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
