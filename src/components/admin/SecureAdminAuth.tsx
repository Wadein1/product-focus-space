
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff } from "lucide-react";

interface SecureAdminAuthProps {
  onAuthSuccess?: () => void;
}

export function SecureAdminAuth({ onAuthSuccess }: SecureAdminAuthProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Authentication failed');
      }

      // Check if user has admin role in metadata
      const userMetadata = authData.user.user_metadata || {};
      if (userMetadata.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Insufficient permissions. Admin access required.');
      }

      // Create admin session token
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const { error: sessionError } = await supabase
        .from('admin_sessions')
        .insert({
          user_id: authData.user.id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString(),
        });

      if (sessionError) {
        console.error('Session creation error:', sessionError);
        // Continue anyway as this is not critical
      }

      // Store secure session information
      sessionStorage.setItem('adminAuthenticated', 'true');
      sessionStorage.setItem('adminSessionToken', sessionToken);
      sessionStorage.setItem('adminUserId', authData.user.id);
      sessionStorage.setItem('adminLoginTime', new Date().toISOString());
      
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
        description: error.message || "Invalid credentials or insufficient permissions",
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
            Sign in with your admin account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <Input
                type="email"
                required
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
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
