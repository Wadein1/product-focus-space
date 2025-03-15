
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const HeroTitle = () => {
  return (
    <div className="text-center space-y-6">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
        Exclusive Drip
        <br />
        <span className="text-secondary/60 text-2xl sm:text-3xl md:text-4xl block mt-2">
          For Any Application
        </span>
      </h1>
      <Link 
        to="/customize" 
        className="inline-flex items-center gap-2 button-primary transform hover:scale-105 transition-all duration-300 text-lg px-8 py-4 rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/40 text-white"
      >
        Get Yours Now
        <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  );
};
