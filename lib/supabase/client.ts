import { createBrowserClient } from '@supabase/ssr';
import { type Database } from '@/lib/database.types';
import { getSupabaseConfig } from './config';

let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const config = getSupabaseConfig();
  
  try {
    supabaseInstance = createBrowserClient<Database>(
      config.url,
      config.anonKey,
      {
        ...config.options,
        auth: {
          ...config.options.auth,
          detectSessionInUrl: true,
          flowType: 'pkce',
          debug: process.env.NODE_ENV === 'development',
          persistSession: true,
          storageKey: 'sb-auth-token',
          storage: {
            getItem: (key) => {
              try {
                return window?.localStorage.getItem(key) || 
                       window?.sessionStorage.getItem(key);
              } catch {
                return null;
              }
            },
            setItem: (key, value) => {
              try {
                window?.localStorage.setItem(key, value);
                window?.sessionStorage.setItem(key, value);
              } catch {
                console.warn('Failed to save auth state');
              }
            },
            removeItem: (key) => {
              try {
                window?.localStorage.removeItem(key);
                window?.sessionStorage.removeItem(key);
              } catch {
                console.warn('Failed to remove auth state');
              }
            },
          },
          autoRefreshToken: true,
          cookieOptions: {
            name: 'sb-auth-token',
            lifetime: 60 * 60 * 24 * 7, // 1 week
            domain: typeof window !== 'undefined' ? window.location.hostname : '',
            sameSite: 'lax',
            path: '/',
            secure: process.env.NODE_ENV === 'production',
          },
        },
        realtime: {
          params: {
            eventsPerSecond: 2,
          },
        },
      }
    );
    return supabaseInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    throw error;
  }
}

// Export a singleton instance
export const supabase = getSupabaseClient();

// Helper function to reset the client (useful for testing)
export function resetSupabaseClient() {
  supabaseInstance = null;
}