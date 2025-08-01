
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { Skeleton } from "@/components/ui/skeleton";
import { FundraiserRequestBanner } from "@/components/FundraiserRequestBanner";

const Index = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <Navbar />
      <Suspense fallback={<HeroSkeleton />}>
        <Hero />
      </Suspense>
      <div className="container mx-auto px-4 py-16">
        <FundraiserRequestBanner />
      </div>
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
