import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const HeroTitle = () => {
  return (
    <div className="text-center space-y-6">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
        Exclusive Drip
        <br />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary/80 to-primary">
          For Any Application
        </span>
      </h1>
      <p className="text-secondary text-lg sm:text-xl max-w-2xl mx-auto">
        Quick, Fast, and Easy
      </p>
      <Link 
        to="/product" 
        className="inline-flex items-center gap-2 button-primary transform hover:scale-105 transition-all duration-300 text-lg px-8 py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30"
      >
        Get Yours Now
        <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  );
};