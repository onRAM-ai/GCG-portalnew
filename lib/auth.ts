import { supabase } from './supabase';
import { type UserRole } from './database.types';

export interface AuthError {
  message: string;
  status?: number;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role?: UserRole;
  } | null;
  error: AuthError | null;
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) throw signInError;

    if (user) {
      // Get user profile with role
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('auth_id', user.id)
        .single();

      if (profileError) throw profileError;

      return {
        user: {
          id: user.id,
          email: user.email || '',
          role: profile?.role,
        },
        error: null,
      };
    }

    return { user: null, error: { message: 'Failed to sign in' } };
  } catch (error: any) {
    return {
      user: null,
      error: {
        message: error.message || 'An unknown error occurred',
        status: error.status,
      },
    };
  }
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    return {
      error: {
        message: error.message || 'An unknown error occurred',
        status: error.status,
      },
    };
  }
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('auth_id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    role: profile?.role,
  };
}