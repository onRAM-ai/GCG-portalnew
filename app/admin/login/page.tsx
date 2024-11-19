import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminLoginForm } from '@/components/admin/login-form';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminLoginPage() {
  const supabase = createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', session.user.id)
      .single();

    if (profile?.role === 'admin') {
      redirect('/admin');
    } else {
      redirect('/');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <AdminLoginForm />
    </div>
  );
}