import { useRef, useEffect } from "react";
import { HeroTitle } from "./hero/HeroTitle";
import { HeroGallery } from "./hero/HeroGallery";
import { useHeroImages } from "@/hooks/useHeroImages";
import { useInView } from "@/hooks/useInView";

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(heroRef);
  const { imagesLoaded } = useHeroImages();

  return (
    <section 
      ref={heroRef}
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div 
          className={`transform transition-all duration-1000 ${
            isInView && imagesLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <HeroTitle />
          <HeroGallery />
        </div>
      </div>
    </section>
  );
};

export default Hero;