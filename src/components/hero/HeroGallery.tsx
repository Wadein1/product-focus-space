import { Link } from "react-router-dom";
import { useHeroImages } from "@/hooks/useHeroImages";

export const HeroGallery = () => {
  const { imagesLoaded } = useHeroImages();
  
  const images = [
    {
      src: "/lovable-uploads/1c66d3e6-15c7-4249-a02a-a6c5e488f6d6.png",
      alt: "Product showcase 1"
    },
    {
      src: "/lovable-uploads/d6daae6b-a26c-4424-a049-ee61f42f02c3.png",
      alt: "Product showcase 2"
    },
    {
      src: "/lovable-uploads/c3b67733-225f-4e30-9363-e13d20ed3100.png",
      alt: "Product showcase 3"
    }
  ];

  const renderDesktopGallery = () => (
    <div className="hidden md:grid md:grid-cols-3 gap-8">
      {images.map((image, index) => (
        <GalleryItem key={index} {...image} />
      ))}
    </div>
  );

  const renderMobileGallery = () => (
    <div className="md:hidden">
      <GalleryItem {...images[2]} />
    </div>
  );

  return (
    <div 
      className={`mt-16 transition-all duration-1000 ${
        imagesLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
    >
      {renderDesktopGallery()}
      {renderMobileGallery()}
    </div>
  );
};

const GalleryItem = ({ src, alt }: { src: string; alt: string }) => (
  <Link 
    to="/product"
    className="relative group overflow-hidden rounded-lg shadow-2xl block"
  >
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      loading="lazy"
    />
  </Link>
);