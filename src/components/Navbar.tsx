
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { DesktopNav } from "./navigation/DesktopNav";
import { MobileNav } from "./navigation/MobileNav";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isFundraisingPage = location.pathname === '/fundraising';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [window.location.pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMenuOpen 
          ? isFundraisingPage 
            ? "bg-green-900/80 backdrop-blur-md shadow-sm" 
            : "bg-background/80 backdrop-blur-md shadow-sm" 
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/e0958741-0938-4578-a927-aaf3a48b2418.png" 
                alt="Logo" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-semibold text-foreground">Gimme Drip</span>
            </Link>
          </div>

          <DesktopNav isFundraisingPage={isFundraisingPage} />
          <MobileNav 
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            isFundraisingPage={isFundraisingPage}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
