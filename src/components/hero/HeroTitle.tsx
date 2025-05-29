
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const HeroTitle = () => {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-4">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-tight">
          Custom <span className="text-primary">Medallions</span>
        </h1>
        <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-300 max-w-4xl mx-auto leading-relaxed">
          Professional custom medallions that bring your vision to life. From sports teams to corporate events, we deliver exceptional personalized medallions.
        </p>
      </div>
      <Link 
        to="/product" 
        className="inline-flex items-center gap-2 button-primary transform hover:scale-105 transition-all duration-300 text-lg px-8 py-4 rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/40 text-white"
      >
        Get Yours Now
        <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  );
};
