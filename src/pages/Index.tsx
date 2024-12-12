import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";

const Index = () => {
  useEffect(() => {
    const sections = document.querySelectorAll(".section-fade");
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
    </div>
  );
};

export default Index;