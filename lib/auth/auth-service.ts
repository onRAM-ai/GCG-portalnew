import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { type Database } from "@/lib/database.types";

const supabase = createClientComponentClient<Database>();

export interface SignUpData {
  email: string;
  password: string;
  role?: "admin" | "user" | "venue";
  name?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role?: string;
    name?: string;
  } | null;
  error: Error | null;
}

export async function signUp({ email, password, role = "user", name }: SignUpData): Promise<AuthResponse> {
  try {
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (signUpError) throw signUpError;

    if (authData.user) {
      // Create profile with role
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          email,
          role,
          name,
          created_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      return {
        user: {
          id: authData.user.id,
          email,
          role,
          name,
        },
        error: null,
      };
    }

    return { user: null, error: new Error("Failed to create user") };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error : new Error("An unknown error occurred"),
    };
  }
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) throw signInError;

    if (user) {
      // Get user profile with role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, name")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      return {
        user: {
          id: user.id,
          email: user.email || "",
          role: profile.role,
          name: profile.name,
        },
        error: null,
      };
    }

    return { user: null, error: new Error("Failed to sign in") };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error : new Error("An unknown error occurred"),
    };
  }
}

export async function signOut(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error("An unknown error occurred"),
    };
  }
}