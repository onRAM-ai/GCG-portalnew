"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/auth/client';
import { type UserRole } from '@/lib/database.types';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string | null;
  role?: UserRole;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('users')
          .select('role')
          .eq('auth_id', session.user.id)
          .single();
          
        if (error) {
          console.error('Error fetching user role:', error);
          toast.error('Failed to fetch user role');
          return;
        }

        setUser({
          id: session.user.id,
          email: session.user.email,
          role: profile?.role,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!user) throw new Error('No user returned from login');

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('auth_id', user.id)
        .single();

      if (profileError) throw profileError;

      const redirectPath = profile?.role === 'admin' ? '/admin'
        : profile?.role === 'venue' ? '/venue'
        : '/dashboard';

      router.push(redirectPath);
      toast.success('Signed in successfully');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error('Sign in failed', {
        description: error.message
      });
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      router.push('/login');
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error('Sign out failed', {
        description: error.message
      });
    }
  };

  return {
    user,
    loading,
    signIn,
    signOut
  };
}
