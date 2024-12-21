import React from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Variation {
  id: string;
  title: string;
  image_path: string;
  is_default: boolean;
}

interface FundraiserVariationsProps {
  variations: Variation[];
  selectedVariation: string | null;
  onVariationSelect: (id: string) => void;
}

export const FundraiserVariations = ({
  variations,
  selectedVariation,
  onVariationSelect,
}: FundraiserVariationsProps) => {
  const [imageUrls, setImageUrls] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadImages = async () => {
      console.log('Loading variations:', variations);
      const urls: Record<string, string> = {};
      
      for (const variation of variations) {
        if (variation.image_path) {
          console.log('Processing variation image:', variation.image_path);
          const { data: { publicUrl } } = supabase
            .storage
            .from('gallery')
            .getPublicUrl(variation.image_path);
          console.log('Generated variation URL:', publicUrl);
          urls[variation.id] = publicUrl;
        }
      }
      
      console.log('Final image URLs:', urls);
      setImageUrls(urls);
      setLoading(false);
    };

    if (variations?.length > 0) {
      loadImages();
    } else {
      console.log('No variations provided');
      setLoading(false);
    }
  }, [variations]);

  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {variations?.map((variation) => (
        <button
          key={variation.id}
          onClick={() => onVariationSelect(variation.id)}
          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
            selectedVariation === variation.id 
              ? 'border-primary shadow-md' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {imageUrls[variation.id] ? (
            <img
              src={imageUrls[variation.id]}
              alt={variation.title}
              className="w-full h-full object-cover"
              loading="eager"
              onError={(e) => {
                console.error('Variation image failed to load:', imageUrls[variation.id]);
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <p className="text-gray-500 text-xs">No image</p>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1">
            <p className="text-white text-xs text-center truncate">
              {variation.title}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};