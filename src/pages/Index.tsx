
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <Suspense fallback={<HeroSkeleton />}>
        <Hero />
      </Suspense>
      
      {/* SEO Content Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="prose prose-gray mx-auto">
          <h1 className="sr-only">Custom Sports Chain and Athletic Medallions</h1>
          <div className="mt-8 text-gray-600 space-y-4">
            <p>
              Transform your athletic achievements into wearable art with our premium custom sports chains and medallions. 
              Perfect for teams, athletes, and sports enthusiasts looking to showcase their pride and accomplishments.
            </p>
            <h2 className="text-2xl font-semibold text-gray-800">Custom Sports Chain Features</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Premium quality lightweight materials for comfortable wear</li>
              <li>Customizable chain colors to match your team colors</li>
              <li>Up to 10 x 10 inch design space for your logo or artwork</li>
              <li>Professional team logo verification service</li>
              <li>Fast production and shipping</li>
            </ul>
            <h2 className="text-2xl font-semibold text-gray-800">Why Choose Our Custom Sports Chains?</h2>
            <p>
              Each custom sports chain is crafted with attention to detail, ensuring your team's identity is perfectly 
              represented. Whether you're a coach looking to reward your team, an athlete celebrating an achievement, 
              or a sports enthusiast wanting to show your team spirit, our custom sports chains are the perfect choice.
            </p>
            <h2 className="text-2xl font-semibold text-gray-800">Design Options</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Upload your own custom design for a unique sports chain</li>
              <li>Let our team create a custom medallion based on your team information</li>
              <li>Choose from various chain colors to match your team's aesthetic</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
};

const HeroSkeleton = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="space-y-8 w-full max-w-7xl px-4">
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
        <Skeleton className="h-12 w-48 mx-auto" />
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

export default Index;
