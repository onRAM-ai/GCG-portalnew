"use client";

import { createBrowserClient } from '@supabase/ssr';
import { type Database } from '@/lib/database.types';

let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined'
    );
  }

  supabaseInstance = createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        debug: process.env.NODE_ENV === 'development',
        cookieOptions: {
          name: 'sb-auth-token',
          lifetime: 60 * 60 * 24 * 7, // 1 week
          domain: typeof window !== 'undefined' ? window.location.hostname : undefined,
          sameSite: 'lax',
          path: '/',
        },
      },
      global: {
        headers: {
          'x-application-name': 'gcg-shift-management',
        },
      },
      db: {
        schema: 'public',
      },
    }
  );

  return supabaseInstance;
}