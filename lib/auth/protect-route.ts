import { headers } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { type Database } from '@/lib/database.types';

type UserRole = Database['public']['Enums']['user_role'];

interface RouteProtectionOptions {
  allowedRoles?: UserRole[];
  redirectTo?: string;
  requireVerified?: boolean;
}

export async function protectRoute(options: RouteProtectionOptions = {}) {
  const supabase = createServerSupabaseClient();
  const headersList = headers();

  try {
    // Validate session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) throw sessionError;
    if (!session) {
      const currentPath = headersList.get('x-url') || '/';
      redirect(`/login?redirectTo=${encodeURIComponent(currentPath)}`);
    }

    // Check email verification if required
    if (options.requireVerified && !session.user.email_confirmed_at) {
      redirect('/verify-email');
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', session.user.id)
      .single();

    if (profileError) throw profileError;

    // Validate role permissions
    if (options.allowedRoles && !options.allowedRoles.includes(profile.role)) {
      const redirectPath = profile.role === 'admin' ? '/admin'
        : profile.role === 'venue' ? '/venue'
        : '/dashboard';
      redirect(redirectPath);
    }

    // Log access attempt
    await supabase.from('access_logs').insert({
      user_id: session.user.id,
      path: headersList.get('x-url'),
      ip_address: headersList.get('x-forwarded-for'),
      user_agent: headersList.get('user-agent'),
    });

    return {
      session,
      user: profile,
    };
  } catch (error) {
    console.error('Route protection error:', error);
    redirect(options.redirectTo || '/login');
  }
}