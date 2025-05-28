
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff } from "lucide-react";

interface AdminAuthProps {
  onAuthSuccess?: () => void;
}

export function AdminAuth({ onAuthSuccess }: AdminAuthProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Attempting login with:', { username, password });
      
      // Check credentials directly first
      if (username !== 'gonzwad' || password !== 'thanksculvers!') {
        console.log('Invalid credentials provided');
        throw new Error('Invalid credentials');
      }

      console.log('Credentials are correct, storing session...');
      
      // Store admin session immediately without database dependency
      sessionStorage.setItem('adminAuthenticated', 'true');
      sessionStorage.setItem('adminUsername', 'gonzwad');
      sessionStorage.setItem('adminLoginTime', new Date().toISOString());
      
      console.log('Session stored successfully');
      
      toast({
        title: "Login successful",
        description: "Welcome to the admin dashboard",
      });

      if (onAuthSuccess) {
        onAuthSuccess();
      }

      navigate('/admin/dashboard', { replace: true });
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast({
        title: "Authentication failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold">Admin Login</h2>
          <p className="text-center text-sm text-gray-600 mt-2">
            Username: gonzwad
          </p>
          <p className="text-center text-xs text-gray-500 mt-1">
            Password: thanksculvers!
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <Input
                type="text"
                required
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Authenticating..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
