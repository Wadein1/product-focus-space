import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";

type SupportType = "broken_replacement" | "other_inquiry";

const Support = () => {
  const [supportType, setSupportType] = useState<SupportType>("other_inquiry");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imagePath = null;
      
      if (image && supportType === "broken_replacement") {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('customer-uploads')
          .upload(fileName, image);

        if (uploadError) throw uploadError;
        imagePath = data.path;
      }

      // Save to database
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          ticket_type: supportType,
          customer_email: email,
          description,
          image_path: imagePath
        });

      if (error) throw error;

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'support',
          data: {
            supportType,
            email,
            description,
            imagePath
          }
        }
      });

      if (emailError) throw emailError;

      toast({
        title: "Support ticket submitted",
        description: "We will get back to you within 3 days.",
      });

      // Reset form
      setSupportType("other_inquiry");
      setEmail("");
      setDescription("");
      setImage(null);
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      toast({
        title: "Error",
        description: "Failed to submit support ticket. Please try again.",
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
        <h1 className="text-4xl font-bold mb-8">Support</h1>
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Support Type</label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={supportType === "broken_replacement" ? "default" : "outline"}
                  onClick={() => setSupportType("broken_replacement")}
                >
                  Broken/Replacement
                </Button>
                <Button
                  type="button"
                  variant={supportType === "other_inquiry" ? "default" : "outline"}
                  onClick={() => setSupportType("other_inquiry")}
                >
                  Other Inquiry
                </Button>
              </div>
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
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Describe your issue"
                className="min-h-[120px]"
              />
            </div>

            {supportType === "broken_replacement" && (
              <div className="space-y-2">
                <label htmlFor="image" className="text-sm font-medium">Upload Image</label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  required
                />
              </div>
            )}

            <div className="text-sm text-muted-foreground mb-4">
              We will get back to you within 3 days.
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Support;