import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

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
    <div className="min-h-screen flex items-center justify-center bg-topo-pattern animate-topo-shift relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-white/95 backdrop-blur-sm" />
      <div
        ref={heroRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 opacity-0 translate-y-4 transition-all duration-1000 relative z-10"
      >
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            Exclusive Drip
            <br />
            <span className="text-secondary/80 font-medium">For Any Application</span>
          </h1>
          <p className="text-secondary text-lg sm:text-xl max-w-2xl mx-auto mb-8">
            Quick, Fast, and Easy
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/product" 
              className="button-primary transform hover:scale-105 transition-all duration-300 text-lg px-8 py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 bg-primary"
            >
              Get Yours Now
            </Link>
          </div>
        </div>
        <div className="mt-16 hidden md:grid md:grid-cols-3 gap-8">
          <div className="relative group">
            <Link to="/product">
              <img
                src="/lovable-uploads/1c66d3e6-15c7-4249-a02a-a6c5e488f6d6.png"
                alt="Product showcase 1"
                className="w-full h-full object-cover rounded-lg shadow-2xl transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
          </div>
          <div className="relative group">
            <Link to="/product">
              <img
                src="/lovable-uploads/d6daae6b-a26c-4424-a049-ee61f42f02c3.png"
                alt="Product showcase 2"
                className="w-full h-full object-cover rounded-lg shadow-2xl transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
          </div>
          <div className="relative group">
            <Link to="/product">
              <img
                src="/lovable-uploads/c3b67733-225f-4e30-9363-e13d20ed3100.png"
                alt="Product showcase 3"
                className="w-full h-full object-cover rounded-lg shadow-2xl transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
          </div>
        </div>
        <div className="mt-16 md:hidden">
          <div className="relative group">
            <Link to="/product">
              <img
                src="/lovable-uploads/c3b67733-225f-4e30-9363-e13d20ed3100.png"
                alt="Product showcase 3"
                className="w-full h-full object-cover rounded-lg shadow-2xl transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;