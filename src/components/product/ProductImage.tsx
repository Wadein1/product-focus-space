import React from 'react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        onFileChange(file);
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
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src="/lovable-uploads/c3b67733-225f-4e30-9363-e13d20ed3100.png"
            alt="Product"
            className="w-full h-full object-cover"
          />
        )}
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