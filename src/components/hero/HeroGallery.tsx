import { Link } from "react-router-dom";

interface HeroGalleryProps {
  imagesLoaded: boolean;
}

export const HeroGallery = ({ imagesLoaded }: HeroGalleryProps) => {
  return (
    <>
      <div 
        className={`mt-16 hidden md:grid md:grid-cols-3 gap-8 transition-opacity duration-1000 ${
          imagesLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {[
          "/lovable-uploads/1c66d3e6-15c7-4249-a02a-a6c5e488f6d6.png",
          "/lovable-uploads/d6daae6b-a26c-4424-a049-ee61f42f02c3.png",
          "/lovable-uploads/c3b67733-225f-4e30-9363-e13d20ed3100.png"
        ].map((src, index) => (
          <div key={index} className="relative group">
            <Link to="/product">
              <img
                src={src}
                alt={`Product showcase ${index + 1}`}
                className="w-full h-full object-cover rounded-lg shadow-2xl transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
          </div>
        ))}
      </div>
      <div 
        className={`mt-16 md:hidden transition-opacity duration-1000 ${
          imagesLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="relative group">
          <Link to="/product">
            <img
              src="/lovable-uploads/c3b67733-225f-4e30-9363-e13d20ed3100.png"
              alt="Product showcase"
              className="w-full h-full object-cover rounded-lg shadow-2xl transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
        </div>
      </div>
    </>
  );
};