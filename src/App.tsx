import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Dashboard from "./pages/admin/Dashboard";
import Support from "./pages/Support";
import Fundraising from "./pages/Fundraising";
import FundraiserPage from "./pages/FundraiserPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/product" element={<Product />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/support" element={<Support />} />
              <Route path="/fundraising" element={<Fundraising />} />
              <Route path="/fundraiser/:customLink" element={<FundraiserPage />} />
              <Route path="/checkout/success" element={<div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">Thank you for your purchase!</h1>
                  <p className="text-gray-600">Your order has been received and is being processed.</p>
                </div>
              </div>} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;