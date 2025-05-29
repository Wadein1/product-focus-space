
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Loader2 } from "lucide-react";

const Fundraising = () => {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('fundraising_requests')
        .insert({
          company_name: companyName,
          contact_email: email,
          description
        });

      if (error) throw error;

      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'fundraising',
          data: {
            companyName,
            email,
            description
          }
        }
      });

      if (emailError) throw emailError;

      toast({
        title: "Request submitted successfully",
        description: "We'll be in touch with you shortly.",
      });

      setEmail("");
      setCompanyName("");
      setDescription("");
    } catch (error) {
      console.error('Error submitting fundraising request:', error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <Navbar />
      <div className="container mx-auto px-4 py-16 mt-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Fundraising Opportunities
            </h1>
            <p className="text-muted-foreground text-lg md:block hidden">
              Partner with us to create meaningful fundraising campaigns for your organization
            </p>
          </div>

          <div className="bg-card rounded-2xl shadow-xl p-8 backdrop-blur-sm backdrop-filter border border-border">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="companyName" className="text-sm font-medium text-foreground">
                  Organization Name
                </label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="w-full"
                  placeholder="Enter your organization name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Contact Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                  placeholder="Enter your email address"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-foreground">
                  Tell us about your fundraising needs
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[120px] w-full"
                  placeholder="Describe your organization and fundraising goals"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </form>
          </div>

          <div className="mt-12 text-center text-muted-foreground">
            <p className="text-sm">
              We typically respond to fundraising requests within 2-3 business days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fundraising;
