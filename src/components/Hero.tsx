import { useRef } from "react";
import { HeroTitle } from "./hero/HeroTitle";
import { HeroGallery } from "./hero/HeroGallery";
import { useHeroImages } from "./hero/useHeroImages";

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { imagesLoaded } = useHeroImages();

  return (
    <div className="min-h-screen flex items-center justify-center bg-topo-pattern animate-topo-shift relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-white/95 backdrop-blur-sm" />
      <div
        ref={heroRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10"
      >
        <div 
          className={`transform transition-all duration-1000 ${
            imagesLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <HeroTitle />
        </div>
        <HeroGallery imagesLoaded={imagesLoaded} />
      </div>
    </div>
  );
};

export default Hero;