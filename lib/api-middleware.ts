import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { type Database } from '@/lib/database.types';
import { logApiRequest } from './api-logger';

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export async function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  allowedRoles?: string[]
) {
  return async (req: NextRequest) => {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    try {
      // Log incoming request
      await logApiRequest({
        id: requestId,
        method: req.method,
        url: req.url,
        headers: Object.fromEntries(req.headers),
        timestamp: new Date().toISOString(),
      });

      const res = NextResponse.next();
      const supabase = createMiddlewareClient<Database>({ req, res });
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      if (!session) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
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

      // Check role permissions
      if (allowedRoles && !allowedRoles.includes(profile.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      // Add user to request
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = {
        id: session.user.id,
        email: session.user.email ?? '',
        role: profile.role,
      };

      // Execute handler
      const response = await handler(authenticatedReq);

      // Log response
      await logApiRequest({
        id: requestId,
        method: req.method,
        url: req.url,
        status: response.status,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      });

      return response;
    } catch (error: any) {
      // Log error
      await logApiRequest({
        id: requestId,
        method: req.method,
        url: req.url,
        error: error.message,
        status: error.status || 500,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        { error: error.message || 'Internal server error' },
        { status: error.status || 500 }
      );
    }
  };
}