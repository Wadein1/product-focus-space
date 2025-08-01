import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FundraiserRequestBanner = () => {
  const navigate = useNavigate();

  return (
    <Card className="border-primary bg-primary/5">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-primary mb-2">
              Want to start your own fundraiser?
            </h3>
            <p className="text-muted-foreground">
              Submit a request and we'll help you create a custom fundraising campaign for your team or organization.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/fundraiser-request')}
            className="flex items-center gap-2"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};