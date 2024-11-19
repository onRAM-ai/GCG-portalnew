import { supabase } from '@/lib/supabase';
import { type UserRole } from '@/lib/database.types';

export interface AdminAuthResponse {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export async function adminLogin(email: string, password: string): Promise<AdminAuthResponse> {
  try {
    const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) throw signInError;
    if (!user) throw new Error('No user returned from login');

    // Verify admin role
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', user.id)
      .single();

    if (profileError) throw profileError;
    if (profile?.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email || '',
        role: profile.role,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'An unknown error occurred',
    };
  }
}

export async function verifyAdminSession(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', session.user.id)
      .single();

    return profile?.role === 'admin';
  } catch (error) {
    console.error('Error verifying admin session:', error);
    return false;
  }
}