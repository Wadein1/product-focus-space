
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, Eye, Key, AlertTriangle, CheckCircle } from 'lucide-react';

export const SecurityEducation = () => {
  const securityTopics = [
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Password Security",
      description: "Learn how to create and manage strong passwords",
      tips: [
        "Use at least 12 characters with a mix of letters, numbers, and symbols",
        "Avoid using personal information like birthdays or names",
        "Use a unique password for each account",
        "Consider using a password manager to generate and store passwords"
      ]
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Multi-Factor Authentication",
      description: "Add an extra layer of security to your accounts",
      tips: [
        "Enable MFA on all important accounts",
        "Use authenticator apps instead of SMS when possible",
        "Keep backup codes in a safe place",
        "Set up multiple MFA methods for redundancy"
      ]
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Recognizing Threats",
      description: "Identify and avoid common security threats",
      tips: [
        "Be suspicious of unexpected emails asking for personal information",
        "Verify website URLs before entering sensitive data",
        "Don't click on links or download attachments from unknown sources",
        "Report suspicious activity immediately"
      ]
    },
    {
      icon: <Key className="h-6 w-6" />,
      title: "Account Recovery",
      description: "Prepare for account recovery scenarios",
      tips: [
        "Keep your recovery email and phone number up to date",
        "Store backup codes in a secure location",
        "Set up trusted devices for account recovery",
        "Know how to contact support if you're locked out"
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <Shield className="h-12 w-12 mx-auto text-blue-600" />
        <h1 className="text-3xl font-bold">Security Education</h1>
        <p className="text-gray-600">
          Learn how to protect your account and stay secure online
        </p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Your account security is our priority. We've implemented 
          advanced password protection that checks against known compromised passwords, 
          and we support multiple MFA options to keep your account safe.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {securityTopics.map((topic, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  {topic.icon}
                </div>
                <div>
                  <CardTitle className="text-lg">{topic.title}</CardTitle>
                  <CardDescription>{topic.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {topic.tips.map((tip, tipIndex) => (
                  <li key={tipIndex} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Security Features We Provide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm">Leaked password protection enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm">Multiple MFA options available</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm">Secure password requirements</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm">Regular security monitoring</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
