import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { SupportForm } from '@/components/support/SupportForm';

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

      const { error } = await supabase
        .from('support_tickets')
        .insert({
          ticket_type: supportType,
          customer_email: email,
          description,
          image_path: imagePath
        });

      if (error) throw error;

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
            <p className="text-gray-600 text-lg md:block hidden">
              We're here to assist you with any questions or concerns
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm backdrop-filter animate-fade-up">
            <SupportForm
              supportType={supportType}
              setSupportType={setSupportType}
              email={email}
              setEmail={setEmail}
              description={description}
              setDescription={setDescription}
              image={image}
              setImage={setImage}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          </div>

          <div className="text-center text-gray-600 mt-8">
            <p>We aim to respond to all support requests within 24-48 hours.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;