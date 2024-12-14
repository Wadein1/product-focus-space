import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";

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
      // First, save to database
      const { error } = await supabase
        .from('fundraising_requests')
        .insert({
          company_name: companyName,
          contact_email: email,
          description
        });

      if (error) throw error;

      // Send email notification
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
        title: "Request submitted",
        description: "We will talk to you shortly.",
      });

      // Reset form
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-16">
        <h1 className="text-4xl font-bold mb-8">Fundraising</h1>
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="companyName" className="text-sm font-medium">Company/Organization Name</label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                placeholder="Enter your company or organization name"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Additional Information (Optional)</label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us more about your fundraising needs"
                className="min-h-[120px]"
              />
            </div>

            <div className="text-sm text-muted-foreground mb-4">
              We will talk to you shortly.
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Fundraising;