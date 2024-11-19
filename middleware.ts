import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { type Database } from '@/lib/database.types';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/login', '/reset-password', '/venues', '/contact'];

// Define role-based route prefixes
const roleRoutes = {
  admin: '/admin',
  venue: '/venue',
  user: '/dashboard'
};

// Validate redirectTo parameter
function isValidRedirectUrl(url: string): boolean {
  try {
    // Must be relative URL or same origin
    return url.startsWith('/') && !url.startsWith('//');
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });
  
  // Get the current path and redirectTo parameter
  const path = req.nextUrl.pathname;
  const redirectTo = req.nextUrl.searchParams.get('redirectTo');
  
  // Allow public routes and static files
  if (
    publicRoutes.includes(path) ||
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
  ) {
    return res;
  }

  try {
    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) throw sessionError;
    
    if (!session) {
      // Store attempted URL for post-login redirect
      const redirectUrl = new URL('/login', req.url);
      if (path !== '/login') {
        redirectUrl.searchParams.set('redirectTo', path);
      }
      return NextResponse.redirect(redirectUrl);
    }

    // Get user role
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', session.user.id)
      .single();

    if (profileError) {
      throw new Error('User profile not found');
    }

    // Validate role-based access
    const userRole = profile.role as keyof typeof roleRoutes;
    const allowedPrefix = roleRoutes[userRole];

    // Check if user is accessing wrong role's routes
    for (const [role, prefix] of Object.entries(roleRoutes)) {
      if (path.startsWith(prefix) && role !== userRole) {
        // Redirect to appropriate dashboard
        return NextResponse.redirect(new URL(allowedPrefix, req.url));
      }
    }

    // Handle redirectTo parameter
    if (path === '/login' && redirectTo && isValidRedirectUrl(redirectTo)) {
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }

    return res;
  } catch (error) {
    console.error('Auth error:', error);
    // Clear session and redirect to login on auth error
    const redirectUrl = new URL('/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }
}

// Configure middleware to run on all routes except public assets
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};