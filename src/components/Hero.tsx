import { useEffect, useRef } from "react";

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("opacity-100", "translate-y-0");
        }
      },
      {
        threshold: 0.1,
      }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-accent to-white pt-16">
      <div
        ref={heroRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 opacity-0 translate-y-4 transition-all duration-1000"
      >
        <div className="text-center">
          <span className="inline-block px-4 py-1 mb-4 text-sm font-medium bg-primary/10 text-primary rounded-full animate-fade-in">
            Introducing Innovation
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            The Future of
            <br />
            <span className="text-primary">Product Design</span>
          </h1>
          <p className="text-secondary text-lg sm:text-xl max-w-2xl mx-auto mb-8">
            Experience the perfect blend of form and function. Designed to
            revolutionize your everyday life with unparalleled precision and
            elegance.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="button-primary">
              Pre-order Now
            </button>
            <button className="px-6 py-3 text-secondary hover:text-primary transition-colors duration-200">
              Learn More →
            </button>
          </div>
        </div>
        <div className="mt-16 relative">
          <div className="aspect-[16/9] max-w-3xl mx-auto">
            <img
              src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1200&q=80"
              alt="Product showcase"
              className="w-full h-full object-cover rounded-lg shadow-2xl animate-float"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent bottom-0 h-20" />
        </div>
      </div>
    </div>
  );
};

export default Hero;