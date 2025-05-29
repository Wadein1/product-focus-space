
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Link2Off, Loader2 } from "lucide-react";

interface SupportFormProps {
  supportType: "broken_replacement" | "other_inquiry";
  setSupportType: (type: "broken_replacement" | "other_inquiry") => void;
  email: string;
  setEmail: (email: string) => void;
  description: string;
  setDescription: (description: string) => void;
  image: File | null;
  setImage: (image: File | null) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const SupportForm = ({
  supportType,
  setSupportType,
  email,
  setEmail,
  description,
  setDescription,
  image,
  setImage,
  isSubmitting,
  onSubmit
}: SupportFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="space-y-4">
        <label className="text-sm font-medium text-foreground block">Support Type</label>
        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant={supportType === "broken_replacement" ? "default" : "outline"}
            onClick={() => setSupportType("broken_replacement")}
            className="h-20 space-x-2 transition-all duration-200 hover:scale-[1.02] md:text-base text-sm"
          >
            <Link2Off className="w-5 h-5 md:block hidden" />
            <span className="md:block hidden">Broken/Replacement</span>
            <span className="md:hidden">Replacement</span>
          </Button>
          <Button
            type="button"
            variant={supportType === "other_inquiry" ? "default" : "outline"}
            onClick={() => setSupportType("other_inquiry")}
            className="h-20 space-x-2 transition-all duration-200 hover:scale-[1.02] md:text-base text-sm"
          >
            <MessageSquare className="w-5 h-5 md:block hidden" />
            <span className="md:block hidden">Other Inquiry</span>
            <span className="md:hidden">Other</span>
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground block">
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
        <label htmlFor="description" className="text-sm font-medium text-foreground block">
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
          <label htmlFor="image" className="text-sm font-medium text-foreground block">
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
          <p className="text-sm text-muted-foreground mt-1">
            Please upload a clear image of the issue
          </p>
        </div>
      )}

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
  );
};
