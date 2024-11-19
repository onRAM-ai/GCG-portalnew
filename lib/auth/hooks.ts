"use client";

import { useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { type Database } from '@/lib/database.types';
import { toast } from 'sonner';
import { useAuthContext } from '@/components/auth/auth-provider';

type User = Database['public']['Tables']['users']['Row'];
type UserRole = Database['public']['Enums']['user_role'];

const RETRY_DELAY = 500;
const MAX_RETRIES = 2;

export function useAuth() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getSupabaseClient();

  const delay = useCallback((ms: number) => new Promise(resolve => setTimeout(resolve, ms)), []);

  const validateRedirectTo = useCallback((url: string): boolean => {
    try {
      // Must be relative URL and not a protocol-relative URL
      return url.startsWith('/') && !url.startsWith('//');
    } catch {
      return false;
    }
  }, []);

  const redirectToDashboard = useCallback((role?: UserRole, redirectTo?: string | null) => {
    if (redirectTo && validateRedirectTo(redirectTo)) {
      router.push(redirectTo);
      return;
    }

    const defaultPath = role === 'admin' ? '/admin'
      : role === 'venue' ? '/venue'
      : '/dashboard';
    
    router.push(defaultPath);
  }, [router, validateRedirectTo]);

  const signIn = useCallback(async (
    email: string, 
    password: string, 
    redirectTo?: string | null,
    retryCount = 0
  ) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.status === 500 && retryCount < MAX_RETRIES) {
          await delay(RETRY_DELAY * Math.pow(2, retryCount));
          return signIn(email, password, redirectTo, retryCount + 1);
        }
        throw error;
      }

      if (!data.user) {
        throw new Error('No user returned from login');
      }

      const { data: userRecord, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", data.user.id)
        .single();

      if (userError) throw userError;

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('auth_id', data.user.id);

      toast.success('Signed in successfully');
      redirectToDashboard(userRecord?.role, redirectTo);

    } catch (error: any) {
      console.error('Sign in error:', error);
      
      let errorMessage = 'Failed to sign in. Please try again.';
      if (error.message === 'Invalid login credentials') {
        errorMessage = 'Invalid email or password';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again in a moment.';
      }
      
      toast.error(errorMessage);
      throw error;
    }
  }, [supabase, delay, redirectToDashboard]);

  const signOut = useCallback(async () => {
    try {
      // Clear any stored session data first
      localStorage.removeItem('sb-auth-token');
      sessionStorage.removeItem('sb-auth-token');

      const { error } = await supabase.auth.signOut({
        scope: 'global'
      });

      if (error) throw error;

      // Force reload to clear any cached auth state
      window.location.href = '/login';
    } catch (error: any) {
      console.error('Sign out error:', error);
      // Even if there's an error, redirect to login
      window.location.href = '/login';
    }
  }, [supabase]);

  return {
    user,
    loading,
    signIn,
    signOut
  };
}

export function useRequireAuth(allowedRoles?: UserRole[]) {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        const currentPath = window.location.pathname;
        const redirectTo = searchParams.get('redirectTo') || currentPath;
        router.push(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
        return;
      }

      if (allowedRoles && (!user.role || !allowedRoles.includes(user.role))) {
        const redirectPath = user.role === 'admin' ? '/admin'
          : user.role === 'venue' ? '/venue'
          : '/dashboard';
        router.push(redirectPath);
      }
    }
  }, [user, loading, router, allowedRoles, searchParams]);

  return { user, loading };
}