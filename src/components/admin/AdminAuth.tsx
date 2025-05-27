
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
      // Check credentials directly
      if (username !== 'gonzwad' || password !== 'thanksculvers!') {
        throw new Error('Invalid credentials');
      }

      // Try to find or create the admin user in the database
      let { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', 'gonzwad')
        .single();

      // If user doesn't exist, create it
      if (adminError && adminError.code === 'PGRST116') {
        const { data: newUser, error: createError } = await supabase
          .from('admin_users')
          .insert({
            username: 'gonzwad',
            email: 'gonzwad@admin.com',
            password_hash: 'thanksculvers!' // In production, this should be hashed
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating admin user:', createError);
          throw new Error('Failed to create admin user');
        }
        adminUser = newUser;
      } else if (adminError) {
        console.error('Database error:', adminError);
        throw new Error('Database connection error');
      }

      // Update last login timestamp
      const { error: updateError } = await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminUser.id);

      if (updateError) {
        console.error('Error updating last login:', updateError);
      }

      // Store admin session
      sessionStorage.setItem('adminAuthenticated', 'true');
      sessionStorage.setItem('adminId', adminUser.id);
      
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
