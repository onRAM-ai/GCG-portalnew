import { getSupabaseClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface HealthCheck {
  id: string;
  status: 'healthy' | 'unhealthy';
  last_checked: string;
  error?: string;
}

export async function initializeDatabase() {
  const supabase = getSupabaseClient();
  
  try {
    // First check if tables exist
    const { error: checkError } = await supabase
      .from('health_checks')
      .select('id')
      .limit(1);

    // If table doesn't exist, run initialization
    if (checkError?.code === '42P01') { // Table doesn't exist error code
      const { error: initError } = await supabase.rpc('initialize_database');
      if (initError) throw initError;
    }

    // Perform health check
    const { data, error: insertError } = await supabase
      .from('health_checks')
      .insert({
        status: 'healthy',
        last_checked: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return data as HealthCheck;
  } catch (error: any) {
    console.error('Database initialization error:', error);
    toast.error('Database initialization failed', {
      description: error.message || 'Please try again later'
    });
    throw error;
  }
}