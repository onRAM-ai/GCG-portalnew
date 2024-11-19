import { createServerSupabaseClient } from '@/lib/supabase/server';
import { type Database } from '@/lib/database.types';
import { SupabaseError } from '@/lib/supabase/errors';

type UserRole = Database['public']['Enums']['user_role'];

interface SecurityConfig {
  allowedRoles?: UserRole[];
  requireVerified?: boolean;
  customCheck?: (user: any) => Promise<boolean>;
}

export async function validateSession(config: SecurityConfig = {}) {
  const supabase = createServerSupabaseClient();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new SupabaseError('Session validation failed', 'AUTH_ERROR', sessionError);
  }

  if (!session) {
    throw new SupabaseError('No active session', 'AUTH_REQUIRED');
  }

  // Get user profile with role
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', session.user.id)
    .single();

  if (profileError) {
    throw new SupabaseError('Failed to fetch user profile', 'PROFILE_ERROR', profileError);
  }

  // Check role permissions
  if (config.allowedRoles && !config.allowedRoles.includes(profile.role)) {
    throw new SupabaseError('Insufficient permissions', 'FORBIDDEN');
  }

  // Check email verification if required
  if (config.requireVerified && !session.user.email_confirmed_at) {
    throw new SupabaseError('Email verification required', 'VERIFICATION_REQUIRED');
  }

  // Run custom security check if provided
  if (config.customCheck) {
    const passed = await config.customCheck(profile);
    if (!passed) {
      throw new SupabaseError('Custom security check failed', 'CUSTOM_CHECK_FAILED');
    }
  }

  return {
    session,
    user: profile,
  };
}