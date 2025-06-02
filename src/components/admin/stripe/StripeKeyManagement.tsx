
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const StripeKeyManagement = () => {
  const { toast } = useToast();
  const [currentMode, setCurrentMode] = useState<'live' | 'test'>('live');
  const [showSecrets, setShowSecrets] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [keys, setKeys] = useState({
    live: {
      secret: '',
      publishable: ''
    },
    test: {
      secret: '',
      publishable: ''
    }
  });

  // Load current keys on component mount
  useEffect(() => {
    loadCurrentKeys();
  }, []);

  const loadCurrentKeys = async () => {
    try {
      // Get current mode from localStorage
      const savedMode = localStorage.getItem('stripe_mode') as 'live' | 'test' || 'live';
      setCurrentMode(savedMode);

      // Get saved keys from localStorage
      const savedKeys = localStorage.getItem('stripe_keys');
      if (savedKeys) {
        setKeys(JSON.parse(savedKeys));
      }
    } catch (error) {
      console.error('Error loading keys:', error);
    }
  };

  const saveKeys = () => {
    try {
      localStorage.setItem('stripe_keys', JSON.stringify(keys));
      localStorage.setItem('stripe_mode', currentMode);
      
      toast({
        title: "Keys saved",
        description: "Stripe API keys have been saved locally."
      });
    } catch (error) {
      console.error('Error saving keys:', error);
      toast({
        title: "Error",
        description: "Failed to save keys",
        variant: "destructive"
      });
    }
  };

  const switchToTestMode = async () => {
    setIsLoading(true);
    try {
      if (!keys.test.secret) {
        toast({
          title: "Test keys required",
          description: "Please enter test API keys before switching to test mode.",
          variant: "destructive"
        });
        return;
      }

      // Update the Supabase secret with test key
      const { error } = await supabase.functions.invoke('update-stripe-key', {
        body: { 
          secret_key: keys.test.secret,
          mode: 'test'
        }
      });

      if (error) throw error;

      setCurrentMode('test');
      localStorage.setItem('stripe_mode', 'test');
      
      toast({
        title: "Switched to test mode",
        description: "Now using Stripe test API keys."
      });
    } catch (error) {
      console.error('Error switching to test mode:', error);
      toast({
        title: "Error",
        description: "Failed to switch to test mode",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchToLiveMode = async () => {
    setIsLoading(true);
    try {
      if (!keys.live.secret) {
        toast({
          title: "Live keys required",
          description: "Please enter live API keys before switching to live mode.",
          variant: "destructive"
        });
        return;
      }

      // Update the Supabase secret with live key
      const { error } = await supabase.functions.invoke('update-stripe-key', {
        body: { 
          secret_key: keys.live.secret,
          mode: 'live'
        }
      });

      if (error) throw error;

      setCurrentMode('live');
      localStorage.setItem('stripe_mode', 'live');
      
      toast({
        title: "Switched to live mode",
        description: "Now using Stripe live API keys."
      });
    } catch (error) {
      console.error('Error switching to live mode:', error);
      toast({
        title: "Error",
        description: "Failed to switch to live mode",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateKey = (mode: 'live' | 'test', type: 'secret' | 'publishable', value: string) => {
    setKeys(prev => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [type]: value
      }
    }));
  };

  const maskKey = (key: string) => {
    if (!key) return '';
    if (showSecrets) return key;
    return key.substring(0, 8) + '••••••••••••••••';
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Stripe API Key Management</CardTitle>
            <CardDescription>
              Manage and switch between live and test Stripe API keys
            </CardDescription>
          </div>
          <Badge variant={currentMode === 'live' ? 'default' : 'secondary'}>
            {currentMode.toUpperCase()} MODE
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode Switching Controls */}
        <div className="flex gap-4">
          <Button
            onClick={switchToTestMode}
            disabled={isLoading || currentMode === 'test'}
            variant={currentMode === 'test' ? 'default' : 'outline'}
          >
            Switch to Test Mode
          </Button>
          <Button
            onClick={switchToLiveMode}
            disabled={isLoading || currentMode === 'live'}
            variant={currentMode === 'live' ? 'default' : 'outline'}
          >
            Switch to Live Mode
          </Button>
          <Button
            onClick={() => setShowSecrets(!showSecrets)}
            variant="ghost"
            size="sm"
          >
            {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>

        <Tabs defaultValue="live" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="live">Live Keys</TabsTrigger>
            <TabsTrigger value="test">Test Keys</TabsTrigger>
          </TabsList>
          
          <TabsContent value="live" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="live-secret">Live Secret Key</Label>
                <Input
                  id="live-secret"
                  type={showSecrets ? "text" : "password"}
                  placeholder="sk_live_..."
                  value={showSecrets ? keys.live.secret : maskKey(keys.live.secret)}
                  onChange={(e) => updateKey('live', 'secret', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="live-publishable">Live Publishable Key</Label>
                <Input
                  id="live-publishable"
                  type="text"
                  placeholder="pk_live_..."
                  value={keys.live.publishable}
                  onChange={(e) => updateKey('live', 'publishable', e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="test" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="test-secret">Test Secret Key</Label>
                <Input
                  id="test-secret"
                  type={showSecrets ? "text" : "password"}
                  placeholder="sk_test_..."
                  value={showSecrets ? keys.test.secret : maskKey(keys.test.secret)}
                  onChange={(e) => updateKey('test', 'secret', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="test-publishable">Test Publishable Key</Label>
                <Input
                  id="test-publishable"
                  type="text"
                  placeholder="pk_test_..."
                  value={keys.test.publishable}
                  onChange={(e) => updateKey('test', 'publishable', e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2">
          <Button onClick={saveKeys} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Keys
          </Button>
          <Button onClick={loadCurrentKeys} variant="outline" className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Reload
          </Button>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Current Status:</h4>
          <p className="text-sm text-muted-foreground">
            Mode: <strong>{currentMode.toUpperCase()}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Secret Key: {maskKey(keys[currentMode].secret) || 'Not set'}
          </p>
          <p className="text-sm text-muted-foreground">
            Publishable Key: {keys[currentMode].publishable || 'Not set'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
