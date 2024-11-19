import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { type Database } from '@/lib/database.types';

interface SessionValidationOptions {
  allowedRoles?: Array<Database['public']['Enums']['user_role']>;
  redirectTo?: string;
}

export async function validateSession(options: SessionValidationOptions = {}) {
  const supabase = createServerSupabaseClient();

  try {
    // Check session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) throw sessionError;
    if (!session) {
      redirect(options.redirectTo || '/login');
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', session.user.id)
      .single();

    if (profileError) throw profileError;

    // Validate role if specified
    if (options.allowedRoles && !options.allowedRoles.includes(profile.role)) {
      // Redirect to appropriate dashboard
      const redirectPath = profile.role === 'admin' ? '/admin'
        : profile.role === 'venue' ? '/venue'
        : '/dashboard';
      redirect(redirectPath);
    }

    return {
      session,
      user: profile,
    };
  } catch (error) {
    console.error('Session validation error:', error);
    redirect('/login');
  }
}