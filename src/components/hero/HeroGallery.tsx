import { Link } from "react-router-dom";
import { useHeroImages } from "@/hooks/useHeroImages";
import { Skeleton } from "@/components/ui/skeleton";

export const HeroGallery = () => {
  const { imagesLoaded, images, loadedCount } = useHeroImages();
  
  const renderDesktopGallery = () => (
    <div className="hidden md:grid md:grid-cols-3 gap-8">
      {images.map((src, index) => (
        <GalleryItem 
          key={src} 
          src={src} 
          alt={`Product showcase ${index + 1}`}
          isLoaded={loadedCount > index}
        />
      ))}
    </div>
  );

  const renderMobileGallery = () => (
    <div className="md:hidden">
      <GalleryItem 
        src={images[2]} 
        alt="Product showcase" 
        isLoaded={loadedCount > 2}
      />
    </div>
  );

  return (
    <div className={`mt-16 transition-all duration-1000 ${
      imagesLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
    }`}>
      {renderDesktopGallery()}
      {renderMobileGallery()}
    </div>
  );
};

const GalleryItem = ({ 
  src, 
  alt,
  isLoaded 
}: { 
  src: string; 
  alt: string;
  isLoaded: boolean;
}) => (
  <Link 
    to="/product"
    className="relative group overflow-hidden rounded-lg shadow-2xl block aspect-square bg-gray-100"
  >
    {!isLoaded && (
      <Skeleton className="absolute inset-0" />
    )}
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}
    />
  </Link>
);