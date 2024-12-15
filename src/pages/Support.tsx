import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { MessageSquare, Image as ImageIcon, Loader2 } from "lucide-react";

const Support = () => {
  const [supportType, setSupportType] = useState<"broken_replacement" | "other_inquiry">("other_inquiry");
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

      // Send email notification with image
      const formData = new FormData();
      formData.append('type', 'support');
      formData.append('supportType', supportType);
      formData.append('email', email);
      formData.append('description', description);
      if (image) {
        const base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(image);
        });
        formData.append('image', String(base64Image));
        formData.append('imageName', image.name);
      }

      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: formData
      });

      if (emailError) throw emailError;

      toast({
        title: "Support ticket submitted",
        description: "We will get back to you within 24-48 hours.",
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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-16 mt-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              How Can We Help?
            </h1>
            <p className="text-gray-600 text-lg">
              We're here to assist you with any questions or concerns
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm backdrop-filter animate-fade-up">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700 block">Support Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={supportType === "broken_replacement" ? "default" : "outline"}
                    onClick={() => setSupportType("broken_replacement")}
                    className="h-20 space-x-2 transition-all duration-200 hover:scale-[1.02]"
                  >
                    <ImageIcon className="w-5 h-5" />
                    <span>Broken/Replacement</span>
                  </Button>
                  <Button
                    type="button"
                    variant={supportType === "other_inquiry" ? "default" : "outline"}
                    onClick={() => setSupportType("other_inquiry")}
                    className="h-20 space-x-2 transition-all duration-200 hover:scale-[1.02]"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>Other Inquiry</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter your email address"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-gray-700 block">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Please describe your issue in detail"
                  className="min-h-[120px] w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {supportType === "broken_replacement" && (
                <div className="space-y-2">
                  <label htmlFor="image" className="text-sm font-medium text-gray-700 block">
                    Upload Image
                  </label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                    required
                    className="w-full cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Please upload a clear image of the issue
                  </p>
                </div>
              )}

              <div className="bg-accent/50 rounded-lg p-4 text-sm text-gray-600">
                <p>We aim to respond to all support requests within 24-48 hours.</p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-lg transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Support Request"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;