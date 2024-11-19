import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type Database, UserRole } from './database.types';
import { redirect } from 'next/navigation';

export const createServerSupabase = () => {
  const cookieStore = cookies();
  return createRouteHandlerClient<Database>({ cookies: () => cookieStore });
};

export async function validateServerSession() {
  const supabase = createServerSupabase();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    redirect('/login');
  }

  return session;
}

export async function getServerUserRole(): Promise<UserRole | null> {
  const supabase = createServerSupabase();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !data?.role) return null;
  return data.role;
}

export const validateUserRole = async (allowedRoles: UserRole[]) => {
  const role = await getServerUserRole();
  if (!role || !allowedRoles.includes(role)) {
    redirect('/unauthorized');
  }
  return role;
};