import { createBrowserClient } from '@supabase/ssr';
import { type Database } from '@/lib/database.types';

let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

function getSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  if (supabaseInstance) {
    return supabaseInstance;
  }

  supabaseInstance = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
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

// Type-safe hooks and utilities
export type SupabaseClient = ReturnType<typeof getSupabaseClient>;

// Error types
export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'SupabaseError';
  }

  static fromError(error: unknown): SupabaseError {
    if (error instanceof SupabaseError) {
      return error;
    }

    if (error instanceof Error) {
      return new SupabaseError(error.message);
    }

    return new SupabaseError('An unknown error occurred');
  }
}

// Utility function to handle Supabase errors
export function handleSupabaseError(error: unknown): never {
  throw SupabaseError.fromError(error);
}