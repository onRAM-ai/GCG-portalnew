import { supabase } from '@/lib/supabase';

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', userId)
      .single();

    if (error) throw error;
    return data?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export async function requireAdmin(userId: string): Promise<void> {
  const isUserAdmin = await isAdmin(userId);
  if (!isUserAdmin) {
    throw new Error('Unauthorized: Admin access required');
  }
}