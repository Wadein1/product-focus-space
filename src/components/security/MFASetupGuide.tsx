
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Smartphone, Mail, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const MFASetupGuide = () => {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const { toast } = useToast();

  const handleEnrollMFA = async () => {
    setIsEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App'
      });

      if (error) {
        throw error;
      }

      if (data) {
        toast({
          title: "MFA Enrollment Started",
          description: "Please scan the QR code with your authenticator app",
        });
      }
    } catch (error: any) {
      console.error('MFA enrollment error:', error);
      toast({
        title: "MFA Setup Error",
        description: error.message || "Failed to start MFA enrollment",
        variant: "destructive",
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const mfaOptions = [
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Authenticator App",
      description: "Use Google Authenticator, Authy, or similar apps",
      recommended: true,
      action: handleEnrollMFA,
      buttonText: "Set up Authenticator"
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Verification",
      description: "Receive codes via email",
      recommended: false,
      action: () => {
        toast({
          title: "Email MFA",
          description: "Email MFA is configured automatically when available",
        });
      },
      buttonText: "Auto-configured"
    },
    {
      icon: <Key className="h-6 w-6" />,
      title: "Hardware Token",
      description: "Use YubiKey or similar hardware tokens",
      recommended: false,
      action: () => {
        toast({
          title: "Hardware Tokens",
          description: "Hardware token support depends on your administrator settings",
        });
      },
      buttonText: "Check Availability"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Shield className="h-12 w-12 mx-auto text-blue-600" />
        <h2 className="text-2xl font-bold">Secure Your Account</h2>
        <p className="text-gray-600">
          Add an extra layer of security with multi-factor authentication
        </p>
      </div>

      <div className="grid gap-4">
        {mfaOptions.map((option, index) => (
          <Card key={index} className={`relative ${option.recommended ? 'border-blue-500' : ''}`}>
            {option.recommended && (
              <div className="absolute -top-2 left-4 bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">
                Recommended
              </div>
            )}
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {option.icon}
                </div>
                <div>
                  <CardTitle className="text-lg">{option.title}</CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Button 
                onClick={option.action}
                disabled={isEnrolling}
                className="w-full"
                variant={option.recommended ? "default" : "outline"}
              >
                {isEnrolling && option.recommended ? "Setting up..." : option.buttonText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Why use MFA?</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Protects against password breaches</li>
          <li>• Prevents unauthorized access even if your password is stolen</li>
          <li>• Required for accessing sensitive features</li>
          <li>• Industry standard security practice</li>
        </ul>
      </div>
    </div>
  );
};
