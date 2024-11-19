import { createBrowserClient } from '@supabase/ssr';
import { type Database } from '@/lib/database.types';

let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

const customStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, value);
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  },
};

export function getSupabaseClient() {
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
        storage: customStorage,
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

// Export a singleton instance
export const supabase = getSupabaseClient();

// Helper function to reset the client (useful for testing)
export function resetSupabaseClient() {
  supabaseInstance = null;
}