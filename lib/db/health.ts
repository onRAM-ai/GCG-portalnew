import { getSupabaseClient } from '@/lib/supabase/client';

export async function checkDatabaseHealth() {
  const supabase = getSupabaseClient();
  
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('health_checks')
      .select('status, last_checked, error')
      .order('last_checked', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    return {
      isHealthy: data?.status === 'healthy',
      lastChecked: data?.last_checked,
      error: data?.error
    };
  } catch (error: any) {
    console.error('Health check failed:', error);
    return {
      isHealthy: false,
      lastChecked: new Date().toISOString(),
      error: error.message || 'Unknown error'
    };
  }
}