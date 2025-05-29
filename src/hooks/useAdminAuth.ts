
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const validateAdminSession = async () => {
    try {
      const adminAuthenticated = sessionStorage.getItem('adminAuthenticated');
      const sessionToken = sessionStorage.getItem('adminSessionToken');
      const userId = sessionStorage.getItem('adminUserId');

      if (!adminAuthenticated || !sessionToken || !userId) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Check if user is still authenticated with Supabase
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || user.id !== userId) {
        clearAdminSession();
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Check if user still has admin role
      const userMetadata = user.user_metadata || {};
      if (userMetadata.role !== 'admin') {
        clearAdminSession();
        setIsAuthenticated(false);
        setIsLoading(false);
        toast({
          title: "Access Revoked",
          description: "Admin privileges have been removed",
          variant: "destructive",
        });
        return;
      }

      // Validate session token in database
      const { data: sessionData, error } = await supabase
        .from('admin_sessions')
        .select('expires_at')
        .eq('session_token', sessionToken)
        .eq('user_id', userId)
        .single();

      if (error || !sessionData) {
        clearAdminSession();
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Check if session has expired
      const expiresAt = new Date(sessionData.expires_at);
      if (expiresAt < new Date()) {
        clearAdminSession();
        setIsAuthenticated(false);
        setIsLoading(false);
        toast({
          title: "Session Expired",
          description: "Please log in again",
          variant: "destructive",
        });
        return;
      }

      setIsAuthenticated(true);
    } catch (error) {
      console.error('Session validation error:', error);
      clearAdminSession();
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAdminSession = () => {
    sessionStorage.removeItem('adminAuthenticated');
    sessionStorage.removeItem('adminSessionToken');
    sessionStorage.removeItem('adminUserId');
    sessionStorage.removeItem('adminLoginTime');
  };

  const logout = async () => {
    const sessionToken = sessionStorage.getItem('adminSessionToken');
    
    if (sessionToken) {
      // Clean up session in database
      await supabase
        .from('admin_sessions')
        .delete()
        .eq('session_token', sessionToken);
    }

    // Sign out from Supabase
    await supabase.auth.signOut();
    
    clearAdminSession();
    setIsAuthenticated(false);
  };

  useEffect(() => {
    validateAdminSession();

    // Re-validate session every 5 minutes
    const interval = setInterval(validateAdminSession, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    logout,
    validateSession: validateAdminSession,
  };
};
