import { supabase } from '@/lib/supabase';
import { type UserRole } from '@/lib/database.types';

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

export async function loginWithEmail(email: string, password: string): Promise<AuthResponse> {
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

export async function registerWithEmail(
  email: string,
  password: string,
  role: UserRole
): Promise<AuthResponse> {
  try {
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) throw signUpError;

    if (user) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          auth_id: user.id,
          email,
          role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      return {
        user: {
          id: user.id,
          email: user.email || '',
          role,
        },
        error: null,
      };
    }

    return { user: null, error: { message: 'Failed to create user' } };
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

export async function logout(): Promise<{ error: AuthError | null }> {
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