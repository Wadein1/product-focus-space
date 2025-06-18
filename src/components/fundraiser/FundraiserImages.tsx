
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface FundraiserImagesProps {
  mainImage: string;
  title: string;
}

export const FundraiserImages = ({ mainImage, title }: FundraiserImagesProps) => {
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    const loadImage = async () => {
      if (!mainImage) {
        console.log('No main image provided');
        setLoading(false);
        return;
      }
      
      console.log('Loading main image:', mainImage, 'on mobile:', isMobile);
      
      try {
        const { data: { publicUrl } } = supabase
          .storage
          .from('gallery')
          .getPublicUrl(mainImage);
          
        console.log('Generated public URL:', publicUrl);
        
        // Test if image loads on mobile
        if (isMobile) {
          const img = new Image();
          img.onload = () => {
            console.log('Mobile image loaded successfully');
            setImageUrl(publicUrl);
            setLoading(false);
          };
          img.onerror = (e) => {
            console.error('Mobile image failed to load:', e);
            setError('Failed to load image on mobile');
            setLoading(false);
          };
          img.src = publicUrl;
        } else {
          setImageUrl(publicUrl);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading image:', error);
        setError('Error generating image URL');
        setLoading(false);
      }
    };

    loadImage();
  }, [mainImage, isMobile]);

  if (loading) {
    return (
      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
        <Skeleton className="w-full h-full" />
        {isMobile && (
          <div className="absolute bottom-2 left-2 text-xs text-gray-500">
            Loading mobile image...
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-gray-500 mb-2">Image loading error</p>
          <p className="text-xs text-gray-400">{error}</p>
          {isMobile && <p className="text-xs text-red-400 mt-2">Mobile device detected</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          loading="eager"
          onError={(e) => {
            console.error('Image failed to load:', imageUrl);
            console.error('Mobile device:', isMobile);
            e.currentTarget.src = '/placeholder.svg';
          }}
          onLoad={() => {
            console.log('Image loaded successfully:', imageUrl);
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <p className="text-gray-500">No image available</p>
            {isMobile && <p className="text-xs text-gray-400 mt-1">Mobile</p>}
          </div>
        </div>
      )}
    </div>
  );
};
