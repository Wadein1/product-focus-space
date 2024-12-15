import { Link } from "react-router-dom";

export const HeroTitle = () => {
  return (
    <div className="text-center animate-fade-in">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight">
        Exclusive Drip
        <br />
        <span className="text-secondary/80 font-medium">For Any Application</span>
      </h1>
      <p className="text-secondary text-lg sm:text-xl max-w-2xl mx-auto mb-8">
        Quick, Fast, and Easy
      </p>
      <Link 
        to="/product" 
        className="inline-block button-primary transform hover:scale-105 transition-all duration-300 text-lg px-8 py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30"
      >
        Get Yours Now
      </Link>
    </div>
  );
};