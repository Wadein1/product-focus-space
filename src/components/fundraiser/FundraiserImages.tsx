import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface FundraiserImagesProps {
  mainImage: string;
  title: string;
}

export const FundraiserImages = ({ mainImage, title }: FundraiserImagesProps) => {
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadImage = async () => {
      if (!mainImage) return;
      
      try {
        const { data: { publicUrl } } = supabase
          .storage
          .from('gallery')
          .getPublicUrl(mainImage);
          
        setImageUrl(publicUrl);
      } catch (error) {
        console.error('Error loading image:', error);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [mainImage]);

  return (
    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
      {loading ? (
        <Skeleton className="w-full h-full" />
      ) : imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          loading="eager"
          onError={(e) => {
            console.error('Image failed to load:', imageUrl);
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">No image available</p>
        </div>
      )}
    </div>
  );
};